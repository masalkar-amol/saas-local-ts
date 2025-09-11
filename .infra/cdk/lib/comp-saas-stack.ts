import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CompSaaSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    // ECR repos for images
    const apiRepo = new ecr.Repository(this, 'ApiRepo', { repositoryName: 'api' });
    const aiRepo  = new ecr.Repository(this, 'AiRepo',  { repositoryName: 'ai'  });
    const webRepo = new ecr.Repository(this, 'WebRepo', { repositoryName: 'web' });

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // RDS Postgres
    const db = new rds.DatabaseInstance(this, 'RdsPg', {
      vpc, engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15 }),
      instanceType: new ec2.InstanceType('t3.micro'),
      allocatedStorage: 20,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      publiclyAccessible: false,
    });

    // ElastiCache Redis (for Celery broker/results)
    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnets', {
      description: 'Redis subnets', subnetIds: vpc.privateSubnets.map(s => s.subnetId)
    });
    const redis = new elasticache.CfnCacheCluster(this, 'Redis', {
      engine: 'redis', cacheNodeType: 'cache.t3.micro', numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref
    });

    // API service (ALB Fargate)
    const api = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'ApiSvc', {
      cluster, cpu: 512, memoryLimitMiB: 1024, desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(apiRepo, process.env.IMAGE_TAG || 'latest'),
        containerPort: 9070,
        environment: {
          DATABASE_HOST: db.instanceEndpoint.hostname,
          REDIS_HOST: redis.attrRedisEndpointAddress,
          // S3/OpenSearch endpoints etc…
        },
      },
      publicLoadBalancer: true,
    });

    // AI service (path route /ai/*)
    const ai = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'AiSvc', {
      cluster, cpu: 512, memoryLimitMiB: 1024, desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(aiRepo, process.env.IMAGE_TAG || 'latest'),
        containerPort: 8001,
      },
      publicLoadBalancer: false,
    });
    api.listener.addTargets('AiPath', {
      priority: 10,
      conditions: [ecs_patterns.ListenerCondition.pathPatterns(['/ai/*'])],
      port: 80,
      targets: [ai.service],
    });

    // WEB as static (option A: S3+CloudFront) or container (option B)
    const web = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'WebSvc', {
      cluster, cpu: 256, memoryLimitMiB: 512, desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(webRepo, process.env.IMAGE_TAG || 'latest'),
        containerPort: 3000,
      },
      publicLoadBalancer: true,
    });

    db.connections.allowDefaultPortFrom(api.service);  // API -> DB
  }
}
