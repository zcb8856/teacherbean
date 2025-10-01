#!/bin/bash

# TeacherBean Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="weteacher"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo -e "${GREEN}🚀 Starting TeacherBean deployment...${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Load environment variables
load_env() {
    echo -e "${YELLOW}Loading environment variables...${NC}"

    if [ -f ".env.${ENVIRONMENT}" ]; then
        export $(cat .env.${ENVIRONMENT} | grep -v '#' | xargs)
        echo -e "${GREEN}✅ Environment variables loaded from .env.${ENVIRONMENT}${NC}"
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '#' | xargs)
        echo -e "${GREEN}✅ Environment variables loaded from .env.local${NC}"
    else
        echo -e "${RED}❌ No environment file found${NC}"
        exit 1
    fi
}

# Build Docker image
build_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"

    docker build \
        --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
        --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
        -t ${PROJECT_NAME}:${VERSION} \
        -t ${PROJECT_NAME}:latest \
        .

    echo -e "${GREEN}✅ Docker image built successfully${NC}"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    echo -e "${YELLOW}Deploying with Docker Compose...${NC}"

    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down

    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d

    echo -e "${GREEN}✅ Application deployed successfully${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    echo -e "${YELLOW}Deploying to Vercel...${NC}"

    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI is not installed${NC}"
        echo "Install it with: npm i -g vercel"
        exit 1
    fi

    # Set environment variables
    vercel env add NEXT_PUBLIC_SUPABASE_URL "${NEXT_PUBLIC_SUPABASE_URL}" production
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" production
    vercel env add SUPABASE_SERVICE_ROLE_KEY "${SUPABASE_SERVICE_ROLE_KEY}" production
    vercel env add OPENAI_API_KEY "${OPENAI_API_KEY}" production

    # Deploy
    if [ "${ENVIRONMENT}" = "production" ]; then
        vercel --prod
    else
        vercel
    fi

    echo -e "${GREEN}✅ Deployed to Vercel successfully${NC}"
}

# Deploy to Netlify
deploy_netlify() {
    echo -e "${YELLOW}Deploying to Netlify...${NC}"

    if ! command -v netlify &> /dev/null; then
        echo -e "${RED}❌ Netlify CLI is not installed${NC}"
        echo "Install it with: npm i -g netlify-cli"
        exit 1
    fi

    # Build the project
    npm run build

    # Deploy
    if [ "${ENVIRONMENT}" = "production" ]; then
        netlify deploy --prod --dir=.next
    else
        netlify deploy --dir=.next
    fi

    echo -e "${GREEN}✅ Deployed to Netlify successfully${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}Performing health check...${NC}"

    local url="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f "${url}/healthz" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check passed${NC}"
            return 0
        fi

        echo "Attempt $attempt/$max_attempts: Waiting for application to be ready..."
        sleep 2
        ((attempt++))
    done

    echo -e "${RED}❌ Health check failed${NC}"
    return 1
}

# Rollback function
rollback() {
    echo -e "${YELLOW}Rolling back deployment...${NC}"

    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --force-recreate
    fi

    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Main deployment function
main() {
    case "${3:-docker}" in
        "docker")
            check_requirements
            load_env
            build_image
            deploy_docker_compose
            health_check
            ;;
        "vercel")
            load_env
            deploy_vercel
            ;;
        "netlify")
            load_env
            deploy_netlify
            ;;
        "rollback")
            rollback
            ;;
        *)
            echo "Usage: $0 [version] [environment] [platform]"
            echo "Platforms: docker, vercel, netlify, rollback"
            echo "Example: $0 v1.0.0 production docker"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}${NC}"