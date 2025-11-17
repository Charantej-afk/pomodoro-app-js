pipeline {
    agent {
        docker {
            image 'node:18' // Node.js environment
            // Use 'root:root' to ensure permissions for apt/package installation
            args '-u root:root' 
            // FIX APPLIED: Explicitly attaching the agent container to the shared Docker network.
            // Network name derived from the directory 'pomodoro-app-js' and the network name 'cicd-network'.
            network 'pomodoro-app-js_cicd-network' 
        }
    }

    environment {
        // --- Deployment & Repository Configuration ---
        DOCKER_IMAGE = 'pomodoro-app'
        NEXUS_REPO = 'npm-releases'
        // Assumes 'nexus' is resolvable on the shared Docker network
        NEXUS_URL = 'http://nexus:8081' 
        
        // --- Sonar Scanner Configuration ---
        SONAR_SERVER_ID = 'SonarQube' // Must match the name configured in Jenkins global config
        SONAR_PROJECT_KEY = 'pomodoro-app'
        SONAR_SCANNER_VERSION = '5.0.1.3006' 
        SONAR_SCANNER_DIR = "sonar-scanner-${SONAR_SCANNER_VERSION}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout the SCM associated with the job
                checkout scm 
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Code') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // This script installs JRE and the scanner CLI inside the node:18 container
                script {
                    // 1. Install Java JRE and necessary tools (curl, unzip)
                    sh """
                        echo 'Installing Java JRE and essential tools...'
                        # -qq flags keep the output quiet
                        apt-get update -y -qq && apt-get install -y openjdk-17-jre unzip curl -qq 
                        
                        echo 'Downloading and extracting SonarQube Scanner CLI...'
                        SONAR_URL="https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${env.SONAR_SCANNER_VERSION}.zip"
                        curl -sSLo sonar-scanner.zip \$SONAR_URL
                        unzip -q sonar-scanner.zip
                    """
                    
                    // 2. Execute SonarQube Analysis (Groovy Step)
                    echo "Starting SonarQube analysis against server ID: ${env.SONAR_SERVER_ID}"
                    withSonarQubeEnv(env.SONAR_SERVER_ID) {
                        // Execute the scanner using its relative path in the workspace
                        sh "${env.SONAR_SCANNER_DIR}/bin/sonar-scanner -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} -Dsonar.sources=."
                    }

                    // 3. Clean up files and dependencies (Shell Step)
                    sh """
                        echo 'Cleaning up scanner files and dependencies...'
                        rm -rf sonar-scanner.zip ${env.SONAR_SCANNER_DIR}
                        # Clean up JRE and apt lists to remove tools only needed for this stage
                        apt-get remove -y openjdk-17-jre unzip curl -qq && apt-get autoremove -y -qq
                        rm -rf /var/lib/apt/lists/*
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE} .'
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                // Uses your 'Dockerhub' credential ID for login
                withCredentials([usernamePassword(credentialsId: 'Dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh '''
                        echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                        docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                        docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                // Uses your 'nexus' credential ID for upload
                withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh """
                        echo 'Creating artifact and deploying to Nexus at ${NEXUS_URL}...'
                        tar -czf pomodoro-app.tar.gz dist/
                        # Curl command uses the internal service name 'nexus'
                        curl -u \${NEXUS_USERNAME}:\${NEXUS_PASSWORD} --upload-file pomodoro-app.tar.gz ${NEXUS_URL}/repository/${NEXUS_REPO}/pomodoro-app.tar.gz
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs for details.'
        }
        always {
             // Clean up the created artifact file
             sh 'rm -f pomodoro-app.tar.gz || true'
        }
    }
}
