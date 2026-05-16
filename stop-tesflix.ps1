# stop-tesflix.ps1
# This script tears down the Tesflix infrastructure to stop AWS billing.

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "WARNING: You are about to safely shut down the Tesflix environment." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

# Step 1: Delete Kubernetes Ingress to trigger ALB deletion
Write-Host "`n[1/3] Deleting Kubernetes Ingress and Application Load Balancer..." -ForegroundColor Cyan
kubectl delete ingress tesflix-ingress --ignore-not-found=true

# Wait for ALB to be deleted by AWS
Write-Host "Waiting 60 seconds for AWS to clean up the Load Balancer..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# Step 2: Destroy Terraform infrastructure
Write-Host "`n[2/3] Destroying Terraform Infrastructure (VPC, EKS Cluster, Nodes)..." -ForegroundColor Cyan
Push-Location .\terraform
terraform destroy -auto-approve -var="grafana_admin_password=admin"
Pop-Location

Write-Host "`n[3/3] Shutdown complete! Your AWS billing has been stopped for the night." -ForegroundColor Green
