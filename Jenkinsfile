pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        AWS_REGION = 'us-east-1'
        DOCKER_HUB_REPO = 'naveennallamsetti/tesflix-hub'
        IMAGE_TAG = "${env.BUILD_ID}"
        CLUSTER_NAME = 'tesflix-cluster'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'naveen-git', url: 'https://github.com/naveennallamsetti/tesflix-proj.git']])
            }
        }

        stage('Test & Build Check') {
            steps {
                sh 'npm ci'
                sh 'npx prisma generate'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                sh "docker tag ${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_REPO}:latest"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'naveen-docker', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                    sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_HUB_REPO}:latest"
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                
                // Apply Kubernetes manifests for new clusters
                sh "kubectl apply -f k8s/"
                
                sh "kubectl set image deployment/tesflix-deployment tesflix=${DOCKER_HUB_REPO}:${IMAGE_TAG} --record"
                
                // Wait for deployment to finish rolling out
                sh "kubectl rollout status deployment/tesflix-deployment --timeout=180s"
                
                // Run database migrations on one of the running pods
                sh '''
                POD_NAME=$(kubectl get pod -l app=tesflix --field-selector status.phase=Running -o jsonpath="{.items[0].metadata.name}")
                kubectl exec $POD_NAME -- npx prisma@6 db push
                '''
            }
        }
    }
}
