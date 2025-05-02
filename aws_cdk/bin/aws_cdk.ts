import { App, Tags } from "aws-cdk-lib";
import { CDKDemoStack } from "../lib/aws_cdk-stack";
import { loadEnv } from "../lib/loadEnv";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {
  SecretsManagerClient,
  DescribeSecretCommand,
  UpdateSecretCommand,
  CreateSecretCommand,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
loadEnv(process.env.NODE_ENV || "production");
import { AwsCredentialIdentityProvider } from "@aws-sdk/types";

// Fetch AWS Login from the current environment (set up by the cdk.sh wrapper)
async function resolveEnv() {
  const account = process.env.CDK_DEFAULT_ACCOUNT;
  const region = process.env.CDK_DEFAULT_REGION;

  if (account && region) {
    return { account, region, credentials: fromNodeProviderChain() };
  }

  const client = new STSClient({});
  const identity = await client.send(new GetCallerIdentityCommand({}));
  const resolvedRegion = process.env.AWS_REGION || "us-east-1";

  if (!identity.Account) {
    throw new Error("Could not resolve AWS Account ID.");
  }

  return {
    account: identity.Account,
    region: resolvedRegion,
    credentials: fromNodeProviderChain(),
  };
}

/* We handle secrets _outside_ of the general Stack creation because
* they cannot be read during synth time to determine whether they need to be created/updated.
* We could have in-Stack secret generation if we created secrets each time, but where we
* want to optionally create secrets where they are different to our supplied values we
* need to do it outside the Stack.
* */
async function prepareSecrets(
  projectName: string,
  secretName: string,
  catAPIKey: string,
  region: string,
  credentials: AwsCredentialIdentityProvider,
) {
  const client = new SecretsManagerClient({
    region,
    credentials,
  });

  try {
    await client.send(new DescribeSecretCommand({ SecretId: secretName }));

    console.log(
      `[INFO] Secret "${secretName}" already exists. Checking contents...`,
    );

    const secretValue = await client.send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );

    if (secretValue.SecretString) {
      const parsed = JSON.parse(secretValue.SecretString);
      if (
        parsed.catAPIKey === catAPIKey
      ) {
        console.log(
          `[INFO] Secret "${secretName}" is up-to-date. No update needed.`,
        );
        return;
      }
    }

    console.log(`[INFO] Secret "${secretName}" contents differ. Updating...`);
    await client.send(
      new UpdateSecretCommand({
        SecretId: secretName,
        SecretString: JSON.stringify({ catAPIKey }),
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.name === "ResourceNotFoundException") {
      console.log(
        `[INFO] Secret "${secretName}" does not exist. Creating now...`,
      );
      await client.send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: JSON.stringify({ catAPIKey }),
          Tags: [
            {
              Key: "project-name",
              Value: projectName,
            },
          ],
        }),
      );
      return;
    }
    throw err; // Unexpected errors rethrown
  }
}

async function main() {
  const app = new App();

  const deploymentDomain = app.node.tryGetContext("deploymentDomain");
  const projectName = app.node.tryGetContext("projectName");

  if (!deploymentDomain || !projectName) {
    throw new Error(
      'Both "deploymentDomain" and "projectName" must be provided as context.',
    );
  }

  // REQUIRED: tell CDK what account + region to deploy to
  const env = await resolveEnv();

  console.log("AWS_PROFILE:", process.env.AWS_PROFILE);
  console.log(
    "AWS_ACCESS_KEY_ID[0:3]:",
    process.env.AWS_ACCESS_KEY_ID?.substring(0, 3),
  );

  const catAPIKey = app.node.tryGetContext("catAPIKey") ?? "";

  if (process.env.NODE_ENV !== "test") {
    if (!catAPIKey) {
      console.warn("No API key for the cat API. Requests may be subject to more aggressive rate-limiting.");
    } else {
      await prepareSecrets(
          projectName,
          `${projectName}/figshare/oauth`,
          catAPIKey,
          env.region,
          env.credentials,
      );
    }
  }

  new CDKDemoStack(app, `${projectName}-Stack`, {
    projectName,
    env,
    deploymentDomain,
    skipDomainLookup:
      app.node.tryGetContext("skipDomainLookup") === "true" ||
      process.env.SKIP_LOOKUPS === "true",
    includeSecrets: process.env.NODE_ENV !== "test" && !!catAPIKey
  });

  // Apply project-wide tag
  Tags.of(app).add("project-name", projectName);
}

// Async-ify the whole setup to allow awaiting resolveEnv and prepareSecrets
main().catch((err) => {
  console.error("CDK App failed to start.");
  console.error(err);
  process.exit(1);
});
