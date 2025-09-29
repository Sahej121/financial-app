const mysql = require('mysql2/promise');

// Database configurations for multiple databases
const dbConfigs = {
  userAuth: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'user_auth_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    
    
  },
  documents: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'documents_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    
    
  },
  caProfiles: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'ca_profiles_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    
    
  },
  analystProfiles: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'analyst_profiles_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    
    
  },
  metadataAnalytics: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'metadata_analytics_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    
    
  }
};

// Create connection pools for each database
const createConnectionPool = (config) => {
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Initialize connection pools
const connections = {
  userAuth: createConnectionPool(dbConfigs.userAuth),
  documents: createConnectionPool(dbConfigs.documents),
  caProfiles: createConnectionPool(dbConfigs.caProfiles),
  analystProfiles: createConnectionPool(dbConfigs.analystProfiles),
  metadataAnalytics: createConnectionPool(dbConfigs.metadataAnalytics)
};

// Test database connections
const testConnections = async () => {
  const results = {};
  
  for (const [name, pool] of Object.entries(connections)) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      results[name] = { status: 'connected', error: null };
      console.log(`✅ ${name} database connected successfully`);
    } catch (error) {
      results[name] = { status: 'error', error: error.message };
      console.error(`❌ ${name} database connection failed:`, error.message);
    }
  }
  
  return results;
};

// Graceful shutdown
const closeConnections = async () => {
  for (const [name, pool] of Object.entries(connections)) {
    try {
      await pool.end();
      console.log(`🔌 ${name} database connection closed`);
    } catch (error) {
      console.error(`❌ Error closing ${name} database:`, error.message);
    }
  }
};

module.exports = {
  connections,
  dbConfigs,
  testConnections,
  closeConnections
};
