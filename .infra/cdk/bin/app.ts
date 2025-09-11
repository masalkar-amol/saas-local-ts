#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CompSaaSStack } from '../lib/comp-saas-stack';

const app = new cdk.App();

new CompSaaSStack(app, 'SaaSLocalTsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
