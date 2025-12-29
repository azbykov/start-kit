#!/bin/bash

# Script to deploy Prisma schema to production database
# Usage: DATABASE_URL="your-production-url" ./scripts/deploy-prisma.sh

set -e

echo "🚀 Deploying Prisma schema to production..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Usage: DATABASE_URL=\"your-production-url\" ./scripts/deploy-prisma.sh"
  exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Apply schema to database
echo "🗄️  Applying schema to database..."
npx prisma db push --skip-generate

echo "✅ Prisma schema deployed successfully!"

