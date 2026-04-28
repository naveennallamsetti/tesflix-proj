#!/bin/bash
# teardown-cluster.sh
# Safely deletes the EKS cluster to stop billing.
# NOTE: This does NOT delete your S3 Bucket or RDS Database, so your video and user data is safe!

echo "=========================================================="
echo "WARNING: You are about to delete the EKS Cluster 'tesflix-cluster'."
echo "Your Jenkins EC2, RDS Database, and S3 Bucket will remain running."
echo "=========================================================="
echo "Starting cluster deletion..."

eksctl delete cluster --name tesflix-cluster --region us-east-1

echo "Cluster deleted successfully! Kubernetes billing has been stopped."
