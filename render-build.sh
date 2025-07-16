#!/bin/bash
echo "Building application..."
npm install
npx prisma generate

echo "Building TypeScript..."
npm run build

echo "Running database migrations..."
npx prisma migrate deploy

echo "Build complete!"
