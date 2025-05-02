# CDKDemo AWS CDK Infrastructure

This directory (`aws_cdk/`) defines the AWS infrastructure needed to deploy the **CDKDemo** application using AWS CDK.

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

### Deploy a Stack

```bash
./cdk.sh deploy --profile matt-sso -c projectName=demo-app-staging -c deploymentDomain=staging.demo-app.example.com
```

_Note_: This command can take quite a long time. If it takes more than 30 minutes, something might be wrong.

### Destroy a Stack

Make sure you use the full dynamic stack name derived from `projectName`:

```bash
./cdk.sh destroy demo-app-staging-Stack --profile matt-sso
```

_Note_: This command can take quite a long time. If it takes more than 30 minutes, something might be wrong.

### Other Commands

```bash
./cdk.sh synth --profile matt-sso -c projectName=demo-app-staging -c deploymentDomain=staging.demo-app.example.com
```


## Notes

- Secrets are managed automatically but require valid `FIGSHARE_CLIENT_ID` and `FIGSHARE_CLIENT_SECRET` values, either from context or environment variables.
- Stack outputs will include important values like the deployed App URL.
- Log groups are automatically assigned a retention policy (7 days for dev/staging, 365 days for production).
- VPCs are configured without NAT gateways for cost efficiency.
- Fargate tasks are set up with access to SecretsManager using a private VPC endpoint.

## Prerequisites

- Run `aws sso login --profile your-profile` if using SSO.
- Export your AWS_PROFILE if you are not using the `cdk.sh` wrapper.
- Ensure you have valid AWS credentials locally.


---

**This setup is designed to be safe, minimal, and production-grade.**

For questions or troubleshooting, check the comments inside `bin/aws_cdk.ts` or the CDK documentation.
