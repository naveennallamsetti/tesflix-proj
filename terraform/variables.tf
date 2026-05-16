variable "grafana_admin_password" {
  description = "Admin password for Grafana (will be stored in Terraform state; consider using a secret manager)"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "tesflix"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
