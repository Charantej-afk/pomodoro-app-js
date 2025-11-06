# Pomodoro Timer Web App

A simple Pomodoro timer with Jenkins CI/CD pipeline for DevOps learning.

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:8080

## Docker

```bash
docker build -t pomodoro-webapp .
docker run -d -p 8080:80 pomodoro-webapp
```

## Commands

- `npm start` - Start dev server (port 8080)
- `npm run build` - Build to dist/
- `npm test` - Run tests
- `npm run clean` - Clean build artifacts

## Features

- 25-min work sessions, 5-min short breaks, 15-min long breaks
- Customizable durations and session counter
- Browser notifications and responsive UI

## Jenkins CI/CD Pipeline

Fully automated CI/CD pipeline with the following stages:

1. **Checkout Code** - Clones repository from GitHub
2. **Install Dependencies** - Runs `npm install`
3. **SonarQube Analysis** - Static code analysis and quality checks
4. **Run Tests** - Executes `npm test`
5. **Build Artifact** - Builds production bundle with `npm run build`
6. **Package Artifact** - Creates versioned tarball (`.tar.gz`)
7. **Upload to Nexus** - Stores artifact in Nexus repository
8. **Deploy to Nginx** - Downloads from Nexus and deploys to Nginx server

### Requirements

- Jenkins with `sonar` and `tomcat` agent labels
- SonarQube server configured in Jenkins
- Nexus Repository Manager
- Nginx web server
- Credentials configured: `nexus` (username/password)

### Deployment

Push to `main` branch triggers automatic deployment. Application is accessible via Nginx at configured server.
