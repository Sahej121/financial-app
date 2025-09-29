require("dotenv").config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database initialization script
class DatabaseInitializer {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
  }

  // Create main connection
  async createConnection() {
    return await mysql.createConnection(this.config);
  }

  // Read and execute SQL file
  async executeSQLFile(connection, filePath) {
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      console.log(`✅ Executed SQL file: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`❌ Error executing SQL file ${filePath}:`, error.message);
      throw error;
    }
  }

  // Initialize all databases
  async initialize() {
    const connection = await this.createConnection();
    
    try {
      console.log('🚀 Starting database initialization...');
      
      // Execute the main schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      await this.executeSQLFile(connection, schemaPath);
      
      console.log('✅ Database initialization completed successfully!');
      console.log('📊 Created databases:');
      console.log('   - user_auth_db (User authentication and sessions)');
      console.log('   - documents_db (Document storage and metadata)');
      console.log('   - ca_profiles_db (CA profiles and specializations)');
      console.log('   - analyst_profiles_db (Analyst profiles and specializations)');
      console.log('   - metadata_analytics_db (System metadata and analytics)');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    } finally {
      await connection.end();
    }
  }

  // Seed initial data
  async seedInitialData() {
    const connection = await this.createConnection();
    
    try {
      console.log('🌱 Seeding initial data...');
      
      // Create admin user
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      const salt = await bcrypt.genSalt(saltRounds);
      
      await connection.execute(`
        INSERT IGNORE INTO user_auth_db.users (name, email, password_hash, salt, role, is_verified)
        VALUES ('Admin User', 'admin@financialapp.com', ?, ?, 'admin', TRUE)
      `, [passwordHash, salt]);
      
      console.log('✅ Admin user created: admin@financialapp.com');
      console.log('🔑 Default password: admin123 (change this in production!)');
      
    } catch (error) {
      console.error('❌ Error seeding initial data:', error.message);
      throw error;
    } finally {
      await connection.end();
    }
  }

  // Test database connections
  async testConnections() {
    const { testConnections } = require('./config');
    return await testConnections();
  }
}

// CLI interface
if (require.main === module) {
  const init = new DatabaseInitializer();
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      init.initialize()
        .then(() => process.exit(0))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
      break;
      
    case 'seed':
      init.seedInitialData()
        .then(() => process.exit(0))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
      break;
      
    case 'test':
      init.testConnections()
        .then(() => process.exit(0))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node init.js [init|seed|test]');
      console.log('  init  - Initialize all databases and tables');
      console.log('  seed  - Seed initial data (admin user)');
      console.log('  test  - Test database connections');
      process.exit(1);
  }
}

module.exports = DatabaseInitializer;
