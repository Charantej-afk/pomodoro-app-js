pipeline {
    agent {
        docker {
            image 'node:18' // Node.js environment for npm commands
            args '-u root:root' // Ensure proper permissions if needed
        }
    }

    tools {
        SonarScanner 'SonarScanner' // Correct tool type for SonarQube Scanner
    }

    environment {
        DOCKER_IMAGE = 'pomodoro-app'
        NEXUS_REPO = 'npm-releases'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Charantej-afk/pomodoro-app-js.git'
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
                withSonarQubeEnv('SonarQube') { // Ensure SonarQube environment is set correctly
                    sh 'sonar-scanner -Dsonar.projectKey=pomodoro-app -Dsonar.sources=.'
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
                withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh '''
                        tar -czf pomodoro-app.tar.gz dist/
                        curl -u ${NEXUS_USERNAME}:${NEXUS_PASSWORD} --upload-file pomodoro-app.tar.gz http://nexus:8081/repository/${NEXUS_REPO}/pomodoro-app.tar.gz
                    '''
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
    }
}
