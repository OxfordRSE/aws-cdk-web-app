# CDKDemo AWS CDK Infrastructure

This directory (`aws_cdk/`) defines the AWS infrastructure needed to deploy the **CDKDemo** application using AWS CDK.
It is designed to be an extendable template for deploying OxRSE projects to AWS.

## Stack description

The stack contains the following resources:

| Resource                        | Description                                                                                            |
|---------------------------------|--------------------------------------------------------------------------------------------------------|
| ECS Fargate Service             | Hosts the Next.js app in a Docker container with automatic HTTPS via ALB (only accessible via ALB).    |
| RDS (PostgreSQL)                | Managed relational database app content. Runs in isolated subnets (inaccessible from the internet).    |
| Application Load Balancer (ALB) | Public-facing ALB that only forwards traffic to ECS tasks, enforces HTTPS, and integrates with WAF.    |
| Secrets Manager                 | Stores and manages OAuth credentials for FigShare integration. Secrets are created/updated pre-deploy. |
| Route53                         | DNS records for routing traffic to the ALB.                                                            |
| ACM Certificates                | Validated via DNS for HTTPS on frontend and backend subdomains.                                        |
| VPC                             | A custom VPC with public and private isolated subnets, no NAT gateways (cost-optimized).               |
| CloudWatch Log Groups           | Centralized logs with environment-aware retention (7 or 365 days).                                     |
| WAF (Web Application Firewall)  | Protects the ALB by blocking malformed requests and common threats (e.g. bad headers, SQL injection).  |

## Key Concepts

- **Secrets Management**:
  - There are two approaches to secrets - user-defined and auto. 
  - User-defined secrets include API keys, etc. They are only updated if required, adn this is done *before* Stack creation.
  - Auto secrets are for Database connections etc. and are created as part of the Stack.

- **Database**
  - The database connection is handled using AWS SecretsManager
  - The database sits in a private isolated subnet, accessed only by the App
  - The database initiation/migration/seeding logic should be handled by the App's Dockerfile
    - More complex setups can add a CustomResource AWS Lambda that does this work

- **Dynamic Naming**: Resources (stacks, secrets, etc.) are named dynamically based on the provided `projectName` context.
    - Example stack name: `demo-app-staging-Stack`, `demo-app-production-Stack`

- **Required Context Values**:
    - `projectName`: Logical name for this deployment (e.g., `demo-app-staging`, `demo-app-production`).
    - `deploymentDomain`: The domain name to use for DNS and HTTPS certificates (e.g., `staging.demo-app.example.com`).

  These must be passed as context parameters via `-c` or set in your `cdk.json`.

- **CDK Wrapper Script**:
    - We provide a `cdk.sh` wrapper script.
    - This ensures that the correct `AWS_PROFILE` is set dynamically when calling `cdk deploy`, `cdk synth`, etc.
    - This avoids credential issues when working with AWS SSO or multiple profiles.

## Usage

### Bootstrap if necessary

You may get errors running the below commands that tell you bootstrapping is required. 
You can do that by:

```bash
./cdk.sh bootstrap --profile sso -c skipDomainLookup=true
```

### Deploy a Stack

First, log into AWS using `aws configure sso` (actually anything that makes you an AWS profile will do fine, but this works for our SSO accounts).
We'll assume you set the profile name to something like 'sso'.

```bash
./cdk.sh deploy --profile sso -c projectName=demo-app -c deploymentDomain=demo-app.oxrse.uk
```

If you've set up your `cdk.json` to include those values you can simply:

```bash
./cdk.sh deploy --profile sso
```

You will see that the required resources are collated and prepared for building. 
You'll then be asked to acknowledge any new IAM permissions granted in the Stack.
After that, the resources will build and you can see detailed progress in the CloudFormation AWS pages.

_Note_: This command can take quite a long time. If it takes more than 30 minutes, something might be wrong.

You can see progress in AWS by going to CloudFormation. 
You can also halt the build there.

### Destroy a Stack

Make sure you use the full dynamic stack name derived from `projectName`:

```bash
./cdk.sh destroy demo-app-Stack --profile sso
```

_Note_: This command can take quite a long time. If it takes more than 30 minutes, something might be wrong.

You can destroy resources from CloudFormation, too. 

**Secrets will not be destroyed as part of the Stack.** 
Destroy secrets manually if you're closing the project.

### Other Commands

```bash
./cdk.sh synth --profile sso -c projectName=demo-app-staging -c deploymentDomain=staging.demo-app.example.com
```

## Prerequisites

- Run `aws sso login --profile your-profile` if using SSO.
- Export your AWS_PROFILE if you are not using the `cdk.sh` wrapper.
- Ensure you have valid AWS credentials locally.

---

**This setup is designed to be safe, minimal, and production-grade.**

For questions or troubleshooting, check the comments inside `bin/aws_cdk.ts` or the CDK documentation.
