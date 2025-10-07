#!/bin/bash

# Production Deployment Script for O'Sullivan House Booking System
# This script helps deploy the application to production

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git"
        exit 1
    fi
    
    print_status "All dependencies are installed ✓"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these environment variables before deploying"
        exit 1
    fi
    
    print_status "Environment variables are set ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_status "Dependencies installed ✓"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if npm run test -- --passWithNoTests; then
        print_status "Tests passed ✓"
    else
        print_error "Tests failed. Please fix tests before deploying"
        exit 1
    fi
}

# Type check
type_check() {
    print_status "Running type check..."
    
    if npm run type-check; then
        print_status "Type check passed ✓"
    else
        print_error "Type check failed. Please fix type errors before deploying"
        exit 1
    fi
}

# Lint code
lint_code() {
    print_status "Running linter..."
    
    if npm run lint; then
        print_status "Linting passed ✓"
    else
        print_warning "Linting failed. Consider fixing linting issues"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Build application
build_app() {
    print_status "Building application..."
    
    if npm run build:prod; then
        print_status "Build successful ✓"
    else
        print_error "Build failed. Please fix build errors before deploying"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_status "Deployment to Vercel completed ✓"
    else
        print_warning "Vercel CLI not found. Please install it with: npm i -g vercel"
        print_status "You can also deploy manually by pushing to your connected Git repository"
    fi
}

# Main deployment function
main() {
    echo "🏠 O'Sullivan House Booking System - Production Deployment"
    echo "=========================================================="
    
    check_dependencies
    check_env_vars
    install_dependencies
    run_tests
    type_check
    lint_code
    build_app
    deploy_vercel
    
    echo ""
    print_status "🎉 Deployment completed successfully!"
    print_status "Your application should now be live in production"
    echo ""
    print_warning "Don't forget to:"
    echo "  - Update your Supabase site URL"
    echo "  - Configure your domain settings"
    echo "  - Set up monitoring and error tracking"
    echo "  - Test all functionality in production"
}

# Run main function
main "$@"
