pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'pomodoro-app'
        NEXUS_REPO = 'npm-releases'
        SONARQUBE_TOKEN = credentials('sonarqube-token') // Jenkins credentials for SonarQube token
        NEXUS_CREDENTIALS = credentials('nexus-credentials') // Jenkins credentials for Nexus
        DOCKERHUB_CREDENTIALS = credentials('Dockerhub') // Jenkins credentials for Docker Hub
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Charantej-afk/pomodoro-app-js.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }

        stage('Build Code') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Lint Code') {
            steps {
                script {
                    // Install ESLint if it's not installed yet
                    sh 'npm install eslint'
                    
                    // Run ESLint using the flat config
                    sh 'npx eslint .'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONARQUBE_TOKEN')]) {
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
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'Dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                            docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
                        '''
                    }
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                        sh '''
                            curl -u ${NEXUS_USERNAME}:${NEXUS_PASSWORD} --upload-file dist/pomodoro-app.tar.gz http://nexus:8081/repository/${NEXUS_REPO}/pomodoro-app.tar.gz
                        '''
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
