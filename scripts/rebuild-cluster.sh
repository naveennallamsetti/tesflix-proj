#!/bin/bash
# rebuild-cluster.sh
# Recreates the EKS cluster, configures secrets, and installs Monitoring

echo "=========================================================="
echo "Starting One-Click Environment Rebuild"
echo "=========================================================="

# 1. Create Cluster
echo "1/5: Creating EKS Cluster 'tesflix-cluster' (This usually takes 15-20 minutes)..."
eksctl create cluster \
  --name tesflix-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# 2. Update Kubeconfig
echo "2/5: Updating Kubernetes configuration..."
aws eks update-kubeconfig --region us-east-1 --name tesflix-cluster

# 3. Apply AWS Secrets
echo "3/5: Injecting AWS S3 and RDS Database Secrets..."
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set."
  echo "Please run: export AWS_ACCESS_KEY_ID=your_key && export AWS_SECRET_ACCESS_KEY=your_secret"
  exit 1
fi

kubectl create secret generic tesflix-secrets \
  --from-literal=AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
  --from-literal=AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
  --from-literal=DATABASE_URL="postgresql://postgres:password123@tesflix-db.c6fa6qc2wgel.us-east-1.rds.amazonaws.com:5432/postgres" \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Install Prometheus & Grafana
echo "4/5: Installing Prometheus and Grafana via Helm..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace

# Wait for Grafana Service to exist before patching
echo "Waiting 30 seconds for Grafana service to start..."
sleep 30

# 5. Expose Grafana via LoadBalancer
echo "5/5: Exposing Grafana to the internet..."
kubectl patch svc monitoring-grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'

echo "=========================================================="
echo "✅ Rebuild Complete!"
echo "=========================================================="
echo "Next Steps:"
echo "1. Go to Jenkins and trigger the 'tesflix-pipeline' job to deploy your app code."
echo "2. Run this command to get your Grafana URL:"
echo "   kubectl get svc monitoring-grafana -n monitoring"
echo "3. Run this command to get your Grafana password:"
echo "   kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath='{.data.admin-password}' | base64 --decode ; echo"
echo "=========================================================="
