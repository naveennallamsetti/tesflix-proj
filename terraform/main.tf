module "vpc" {
  source       = "./networking"
  project_name = var.project_name
}

module "eks" {
  source          = "./compute"
  cluster_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_instance_type = "m7i-flex.large"
  desired_capacity   = 3
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}
