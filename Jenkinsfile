pipeline {
    agent any

    environment {
        // Define necessary environment variables
        DOCKER_IMAGE = 'pomodoro-app'
        NEXUS_REPO = 'npm-releases'
        SONARQUBE_TOKEN = credentials('sonarqube-token') // Jenkins credentials
        NEXUS_CREDENTIALS = credentials('nexus-credentials') // Jenkins credentials
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials') // Jenkins credentials
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout the code from GitHub
                git branch: 'main', url: 'https://github.com/Charantej-afk/pomodoro-app-js.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install dependencies via npm
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Run tests using npm
                    sh 'npm test'
                }
            }
        }

        stage('Lint Code') {
            steps {
                script {
                    // Lint the code using ESLint
                    sh 'npx eslint .'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    // Run SonarQube analysis
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=pomodoro-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.login=${SONARQUBE_TOKEN}
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh """
                        docker build -t ${DOCKER_IMAGE} .
                    """
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    // Push the Docker image to Docker Hub
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                            docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                script {
                    // Deploy the built artifact to Nexus
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                        sh """
                            curl -u ${NEXUS_USERNAME}:${NEXUS_PASSWORD} --upload-file dist/pomodoro-app.tar.gz http://nexus:8081/repository/${NEXUS_REPO}/pomodoro-app.tar.gz
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
