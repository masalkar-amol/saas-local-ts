import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CompSaaSStack } from './comp-saas-stack';

export class CompPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'SaaSLocalTsPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('masalkar-amol/saas-local-ts', 'main', {
          // Prefer CodeStar connection in production
        }),
        commands: [
          'cd .infra/cdk',
          'npm ci || npm i',
          'npx cdk synth'
        ]
      })
    });

    const dev = new cdk.Stage(this, 'Dev');
    new CompSaaSStack(dev, 'SaaSLocalTsStack-Dev');

    const prod = new cdk.Stage(this, 'Prod');
    new CompSaaSStack(prod, 'SaaSLocalTsStack-Prod');

    pipeline.addStage(dev);
    pipeline.addStage(prod, { pre: [ new ManualApprovalStep('PromoteToProd') ] });
  }
}
