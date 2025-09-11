import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CompSaaSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Networking
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    // ECS
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // ECR repos (must exist; create once manually or via pipeline step)
    const apiRepo = ecr.Repository.fromRepositoryName(this, 'ApiRepo', 'api');
    const aiRepo  = ecr.Repository.fromRepositoryName(this, 'AiRepo',  'ai');
    const webRepo = ecr.Repository.fromRepositoryName(this, 'WebRepo', 'web');

    // Read image tags from SSM (populated by GitHub Actions)
    const apiTag = ssm.StringParameter.valueForStringParameter(this, '/saas-local-ts/apiImageTag', 1);
    const aiTag  = ssm.StringParameter.valueForStringParameter(this, '/saas-local-ts/aiImageTag',  1);
    const webTag = ssm.StringParameter.valueForStringParameter(this, '/saas-local-ts/webImageTag', 1);

    // Logs
    const logGroupApi = new logs.LogGroup(this, 'ApiLogs', { retention: logs.RetentionDays.ONE_WEEK });
    const logGroupAi  = new logs.LogGroup(this, 'AiLogs',  { retention: logs.RetentionDays.ONE_WEEK });
    const logGroupWeb = new logs.LogGroup(this, 'WebLogs', { retention: logs.RetentionDays.ONE_WEEK });

    // API service (ALB Fargate)
    const apiSvc = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ApiService', {
      cluster,
      desiredCount: 1,
      publicLoadBalancer: true,
      cpu: 512,
      memoryLimitMiB: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(apiRepo, apiTag),
        containerName: 'api',
        containerPort: 9070,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'api', logGroup: logGroupApi }),
        environment: {
          // TODO: add DB/Redis/OpenSearch endpoints or SSM/Secrets
        }
      }
    });

    // AI service (internal Fargate)
    const aiTask = new ecs.FargateTaskDefinition(this, 'AiTask', {
      cpu: 512,
      memoryLimitMiB: 1024
    });
    const aiContainer = aiTask.addContainer('ai', {
      image: ecs.ContainerImage.fromEcrRepository(aiRepo, aiTag),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'ai', logGroup: logGroupAi })
    });
    aiContainer.addPortMappings({ containerPort: 8001 });

    const aiSvc = new ecs.FargateService(this, 'AiService', {
      cluster,
      desiredCount: 1,
      taskDefinition: aiTask,
      assignPublicIp: true // or place behind NLB/ALB if you want private networking
    });

    // Allow API -> AI (if API calls AI over 8001)
    aiSvc.connections.allowFrom(apiSvc.service, ec2.Port.tcp(8001));

    // WEB service (ALB Fargate)
    const webSvc = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'WebService', {
      cluster,
      desiredCount: 1,
      publicLoadBalancer: true,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(webRepo, webTag),
        containerName: 'web',
        containerPort: 3000,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'web', logGroup: logGroupWeb })
      }
    });

    new cdk.CfnOutput(this, 'ApiURL', { value: `http://${apiSvc.loadBalancer.loadBalancerDnsName}` });
    new cdk.CfnOutput(this, 'WebURL', { value: `http://${webSvc.loadBalancer.loadBalancerDnsName}` });
  }
}
