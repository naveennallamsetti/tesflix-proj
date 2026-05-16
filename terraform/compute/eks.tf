/*
 * terraform/compute/eks.tf
 * Managed EKS cluster with node groups.
 */

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"
  subnet_ids      = var.subnet_ids
  vpc_id          = var.vpc_id
  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    primary = {
      desired_size = var.desired_capacity
      max_size     = var.desired_capacity + 3
      min_size     = 1
      instance_types = [var.node_instance_type]
      subnet_ids     = var.subnet_ids
    }
  }

  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    Name = var.cluster_name
  }
}


