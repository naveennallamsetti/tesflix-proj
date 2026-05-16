# start-tesflix.ps1
# This script spins up the Tesflix infrastructure and automatically wires the DNS.

$domain = "naveensaaho.online"
$route53ZoneId = "Z0579435KC0USAF8IDW2"

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "Starting the Tesflix environment... (This will take ~15 mins)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

# Step 1: Provision Infrastructure
Write-Host "`n[1/5] Provisioning Terraform Infrastructure (VPC, EKS Cluster, Nodes)..." -ForegroundColor Cyan
Push-Location .\terraform
terraform apply -auto-approve -var="grafana_admin_password=admin"
Pop-Location

# Step 2: Connect Kubernetes
Write-Host "`n[2/5] Updating Kubernetes Configuration..." -ForegroundColor Cyan
aws eks update-kubeconfig --region us-east-1 --name tesflix

# Step 3: Deploy Application
Write-Host "`n[3/5] Deploying Tesflix Application to Kubernetes..." -ForegroundColor Cyan
kubectl apply -f k8s/

# Step 4: Wait for Application Load Balancer
Write-Host "`n[4/5] Waiting for AWS to generate the Application Load Balancer..." -ForegroundColor Cyan
$albDns = ""
while (-not $albDns) {
    Start-Sleep -Seconds 15
    $albDns = kubectl get ingress tesflix-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
}
Write-Host "ALB generated successfully: $albDns" -ForegroundColor Green

# Step 5: Update DNS in Route53 automatically
Write-Host "`n[5/5] Automatically updating AWS Route53 DNS for $domain..." -ForegroundColor Cyan

# Fetch the hidden HostedZoneId for the ALB
$albZoneId = aws elbv2 describe-load-balancers --query "LoadBalancers[?DNSName=='$albDns'].CanonicalHostedZoneId" --output text

# Generate the JSON payload for Route53
$json = @"
{
  "Comment": "Automated update of ALIAS record for Tesflix",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$domain",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "$albZoneId",
          "DNSName": "dualstack.$albDns.",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
"@
$json | Out-File "route53-update.json" -Encoding UTF8

# Push the update to Route53
aws route53 change-resource-record-sets --hosted-zone-id $route53ZoneId --change-batch file://route53-update.json

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "Your application is live and $domain will route to it once DNS propagates." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
