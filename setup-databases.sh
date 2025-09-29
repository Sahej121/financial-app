#!/bin/bash

# Financial App Database Setup Script
echo "🚀 Setting up Financial App Databases..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials before continuing."
    echo "   Run: nano .env"
    exit 1
fi

# Install database dependencies
echo "📦 Installing database dependencies..."
cd database
npm install

# Initialize databases
echo "🗄️  Initializing databases..."
node init.js init

# Seed initial data
echo "🌱 Seeding initial data..."
node init.js seed

# Test connections
echo "�� Testing database connections..."
node init.js test

echo "✅ Database setup completed successfully!"
echo ""
echo "📊 Created databases:"
echo "   - user_auth_db (User authentication)"
echo "   - documents_db (Document storage)"
echo "   - ca_profiles_db (CA profiles)"
echo "   - analyst_profiles_db (Analyst profiles)"
echo "   - metadata_analytics_db (Analytics & metadata)"
echo ""
echo "🔑 Admin credentials:"
echo "   Email: admin@financialapp.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password in production!"
