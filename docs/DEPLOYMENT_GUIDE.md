# Deployment Guide

This guide covers various deployment options for the Financial Management Platform, from simple hosting to enterprise-grade cloud deployments.

## 📖 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Environment Setup](#environment-setup)
3. [Local Production Build](#local-production-build)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [Docker Deployment](#docker-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Deployment Overview

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx/ALB)   │◄──►│   (Node.js)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   File Storage   │    │   Cache Layer   │
│   (CloudFront)  │    │   (AWS S3)      │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Options

1. **Simple Hosting**: VPS with PM2
2. **Cloud Platforms**: AWS, Google Cloud, Azure
3. **Containerized**: Docker with Docker Compose
4. **Kubernetes**: Enterprise-grade orchestration
5. **Serverless**: AWS Lambda, Vercel, Netlify

---

## ⚙️ Environment Setup

### Production Environment Variables

Create a `.env.production` file in the server directory:

```env
# Database Configuration
DB_USER=production_user
DB_PASSWORD=very_secure_production_password
DB_NAME=financial_app_prod
DB_HOST=your-production-db-host
DB_PORT=5432

# JWT Configuration
JWT_SECRET=very_long_and_secure_jwt_secret_for_production_at_least_64_characters

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration
REACT_APP_API_URL=https://api.yourdomain.com/api

# Email Configuration
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com

# External Services
ZOOM_API_KEY=your_production_zoom_api_key
ZOOM_API_SECRET=your_production_zoom_api_secret
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret

# AWS Configuration (if using S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-production-bucket

# Redis Configuration (if using caching)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
DB_HOST=localhost
REACT_APP_API_URL=http://localhost:3001/api
LOG_LEVEL=debug
```

#### Staging
```env
NODE_ENV=staging
DB_HOST=staging-db-host
REACT_APP_API_URL=https://staging-api.yourdomain.com/api
LOG_LEVEL=info
```

#### Production
```env
NODE_ENV=production
DB_HOST=production-db-host
REACT_APP_API_URL=https://api.yourdomain.com/api
LOG_LEVEL=warn
```

---

## 🏗️ Local Production Build

### Building the Application

#### 1. Build Frontend
```bash
# Navigate to client directory
cd client

# Install dependencies
npm ci

# Build for production
npm run build

# The build will be created in the 'build' directory
```

#### 2. Prepare Backend
```bash
# Navigate to server directory
cd server

# Install production dependencies only
npm ci --only=production

# Copy environment file
cp .env.production .env
```

#### 3. Database Setup
```bash
# Create production database
createdb financial_app_prod

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

#### 4. Start Production Server
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start src/index.js --name "financial-app-api"

# Or using Node.js directly
NODE_ENV=production node src/index.js
```

### PM2 Configuration

Create `ecosystem.config.js` in the server directory:

```javascript
module.exports = {
  apps: [{
    name: 'financial-app-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## ☁️ Cloud Deployment Options

### AWS Deployment

#### 1. EC2 Instance Setup

**Launch EC2 Instance:**
- Instance Type: t3.medium or larger
- OS: Ubuntu 20.04 LTS
- Security Group: Allow ports 22, 80, 443, 3001

**Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

#### 2. RDS Database Setup

**Create RDS Instance:**
- Engine: PostgreSQL
- Instance Class: db.t3.micro (for testing) or db.t3.small (for production)
- Storage: 20GB minimum
- Security Group: Allow port 5432 from EC2 security group

**Configure Database:**
```bash
# Connect to RDS
psql -h your-rds-endpoint -U postgres -d postgres

# Create database and user
CREATE DATABASE financial_app_prod;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE financial_app_prod TO app_user;
```

#### 3. S3 Bucket Setup

**Create S3 Bucket:**
```bash
# Create bucket
aws s3 mb s3://your-financial-app-bucket

# Configure CORS
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket your-financial-app-bucket --cors-configuration file://cors.json
```

#### 4. Application Deployment

**Deploy Application:**
```bash
# Clone repository
git clone https://github.com/your-repo/financial-app.git
cd financial-app

# Install dependencies
npm run install-all

# Build frontend
cd client && npm run build && cd ..

# Configure environment
cd server
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run migrate

# Start application
pm2 start ecosystem.config.js --env production
```

#### 5. Nginx Configuration

Create `/etc/nginx/sites-available/financial-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        root /path/to/financial-app/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/financial-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Google Cloud Platform Deployment

#### 1. App Engine Deployment

**Create `app.yaml` in server directory:**
```yaml
runtime: nodejs16
env: standard

env_variables:
  NODE_ENV: production
  DB_HOST: /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
  DB_USER: app_user
  DB_PASSWORD: your_password
  DB_NAME: financial_app_prod
  JWT_SECRET: your_jwt_secret

beta_settings:
  cloud_sql_instances: PROJECT_ID:REGION:INSTANCE_NAME

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
```

**Deploy:**
```bash
gcloud app deploy
```

#### 2. Cloud Run Deployment

**Create `Dockerfile` for Cloud Run:**
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
```

**Deploy to Cloud Run:**
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/financial-app

# Deploy to Cloud Run
gcloud run deploy financial-app \
  --image gcr.io/PROJECT_ID/financial-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Azure Deployment

#### 1. App Service Deployment

**Create `web.config` for Azure:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="src/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^src/index.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="src/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>
```

**Deploy using Azure CLI:**
```bash
# Create resource group
az group create --name financial-app-rg --location eastus

# Create app service plan
az appservice plan create --name financial-app-plan --resource-group financial-app-rg --sku B1

# Create web app
az webapp create --resource-group financial-app-rg --plan financial-app-plan --name financial-app-prod --runtime "NODE|16-lts"

# Deploy code
az webapp deployment source config --name financial-app-prod --resource-group financial-app-rg --repo-url https://github.com/your-repo/financial-app --branch main --manual-integration
```

---

## 🐳 Docker Deployment

### Docker Configuration

#### 1. Backend Dockerfile

Create `server/Dockerfile`:
```dockerfile
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "src/index.js"]
```

#### 2. Frontend Dockerfile

Create `client/Dockerfile`:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  # Database
  db:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: financial_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis (for caching)
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  api:
    build: ./server
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: postgres
      DB_PASSWORD: password
      DB_NAME: financial_app
      REDIS_HOST: redis
      JWT_SECRET: your_jwt_secret
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./server/uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - api
    environment:
      REACT_APP_API_URL: http://localhost:3001/api

volumes:
  postgres_data:
  redis_data:
```

#### 4. Nginx Configuration for Frontend

Create `client/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api {
            proxy_pass http://api:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

#### 5. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale api=3

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: financial_app_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm run install-all
    
    - name: Run tests
      run: npm test
      env:
        DB_HOST: localhost
        DB_USER: postgres
        DB_PASSWORD: postgres
        DB_NAME: financial_app_test
        JWT_SECRET: test_secret
    
    - name: Build application
      run: |
        cd client
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: financial-app
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster financial-app-cluster --service financial-app-service --force-new-deployment
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "16"
  POSTGRES_DB: financial_app_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

services:
  - postgres:13

before_script:
  - apt-get update -qq && apt-get install -y -qq git curl
  - curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  - apt-get install -y nodejs
  - npm install -g npm@latest

test:
  stage: test
  script:
    - npm run install-all
    - npm test
  only:
    - merge_requests
    - main

build:
  stage: build
  script:
    - npm run install-all
    - cd client && npm run build
  artifacts:
    paths:
      - client/build/
    expire_in: 1 hour
  only:
    - main

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    - # Add staging deployment commands
  environment:
    name: staging
    url: https://staging.yourdomain.com
  only:
    - main

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - # Add production deployment commands
  environment:
    name: production
    url: https://yourdomain.com
  when: manual
  only:
    - main
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### 1. Health Check Endpoint

Create `server/src/healthcheck.js`:

```javascript
const express = require('express');
const { sequelize } = require('./models');

const app = express();

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memUsageMB,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = app;
```

#### 2. Logging Configuration

Create `server/src/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'financial-app' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### 3. Error Tracking with Sentry

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Use Sentry middleware
app.use(Sentry.requestHandler());
app.use(Sentry.tracingHandler());

// Error handler
app.use(Sentry.errorHandler());
```

### Performance Monitoring

#### 1. PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Monitor in real-time
pm2 monit

# View logs
pm2 logs

# Restart on file changes
pm2 start ecosystem.config.js --watch
```

#### 2. Database Monitoring

```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('financial_app'));
```

---

## 🔒 Security Considerations

### SSL/TLS Configuration

#### 1. Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. Security Headers

```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

### Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Database Security

```sql
-- Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE financial_app TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
SELECT pg_reload_conf();
```

---

## ⚡ Performance Optimization

### Frontend Optimization

#### 1. Build Optimization

```javascript
// webpack.config.js optimizations
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};
```

#### 2. CDN Configuration

```javascript
// Use CDN for static assets
const cdnUrl = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.yourdomain.com' 
  : '';

// In your build process
module.exports = {
  publicPath: cdnUrl,
};
```

### Backend Optimization

#### 1. Database Optimization

```javascript
// Add database indexes
await queryInterface.addIndex('documents', ['user_id', 'status']);
await queryInterface.addIndex('meetings', ['client_id', 'starts_at']);
await queryInterface.addIndex('users', ['email']);

// Connection pooling
const sequelize = new Sequelize(database, username, password, {
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

#### 2. Caching Strategy

```javascript
const Redis = require('redis');
const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/analytics/summary', cache(300), analyticsController.getSummary);
```

---

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Issues

```bash
# Check database connectivity
psql -h your-host -U your-user -d your-database

# Check connection pool
netstat -an | grep 5432

# Monitor database connections
SELECT * FROM pg_stat_activity;
```

#### 2. Memory Issues

```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# PM2 memory monitoring
pm2 monit

# Node.js memory debugging
node --inspect src/index.js
```

#### 3. Performance Issues

```bash
# Monitor CPU usage
top
htop

# Monitor disk I/O
iostat -x 1

# Monitor network
netstat -i
```

### Log Analysis

```bash
# View application logs
tail -f logs/combined.log

# Search for errors
grep -i error logs/combined.log

# Monitor real-time logs
pm2 logs --lines 100
```

### Backup and Recovery

```bash
# Database backup
pg_dump -h your-host -U your-user financial_app > backup.sql

# Restore database
psql -h your-host -U your-user financial_app < backup.sql

# File backup
tar -czf uploads-backup.tar.gz uploads/

# Restore files
tar -xzf uploads-backup.tar.gz
```

---

This deployment guide provides comprehensive instructions for deploying the Financial Management Platform across various environments. Choose the deployment method that best fits your requirements and infrastructure.
