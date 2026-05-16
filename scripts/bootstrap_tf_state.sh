#!/usr/bin/env bash
set -euo pipefail

# --------------------------------------------------------------
# PURPOSE:
#   Create an S3 bucket (with versioning) and a DynamoDB table
#   for Terraform remote state locking.
#   Run this script once before any `terraform init`.
# --------------------------------------------------------------

# USER CONFIGURATION (replace values before running)
AWS_REGION="us-east-1"            # e.g., us-east-1
BUCKET_NAME="tesflix-tf-state"   # must be globally unique
DDB_TABLE_NAME="tesflix-tf-lock" # lock table name

# Ensure AWS CLI is installed and configured with credentials
if ! command -v aws >/dev/null 2>&1; then
  echo "[ERROR] AWS CLI not found. Install it first (https://aws.amazon.com/cli/)"
  exit 1
fi

# 1. Create S3 bucket
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"

# Enable versioning (recommended for state safety)
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# Optional: Block public access (security best‑practice)
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 2. Create DynamoDB lock table
aws dynamodb create-table \
  --table-name "$DDB_TABLE_NAME" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Output instructions for Terraform backend configuration
cat <<EOF

=== Terraform Backend Configuration ===
Add the following block to your terraform/backend.tf (or to the backend config in providers.tf):

terraform {
  backend "s3" {
    bucket         = "$BUCKET_NAME"
    key            = "terraform.tfstate"
    region         = "$AWS_REGION"
    dynamodb_table = "$DDB_TABLE_NAME"
    encrypt        = true
  }
}

Now you can run:
  cd terraform
  terraform init
EOF
