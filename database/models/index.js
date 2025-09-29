// Database Models Index
const UserAuth = require('./UserAuth');
const Documents = require('./Documents');
const CAProfiles = require('./CAProfiles');
const AnalystProfiles = require('./AnalystProfiles');
const MetadataAnalytics = require('./MetadataAnalytics');

// Initialize model instances
const userAuth = new UserAuth();
const documents = new Documents();
const caProfiles = new CAProfiles();
const analystProfiles = new AnalystProfiles();
const metadataAnalytics = new MetadataAnalytics();

// Unified Database Manager
class DatabaseManager {
  constructor() {
    this.userAuth = userAuth;
    this.documents = documents;
    this.caProfiles = caProfiles;
    this.analystProfiles = analystProfiles;
    this.metadataAnalytics = metadataAnalytics;
  }

  // Test all database connections
  async testConnections() {
    const { testConnections } = require('../config');
    return await testConnections();
  }

  // Close all database connections
  async closeConnections() {
    const { closeConnections } = require('../config');
    return await closeConnections();
  }

  // Get user with profile data
  async getUserWithProfile(userId) {
    const user = await this.userAuth.findById(userId);
    if (!user) return null;

    let profile = null;
    if (user.role === 'ca') {
      profile = await this.caProfiles.findByUserId(userId);
    } else if (user.role === 'analyst') {
      profile = await this.analystProfiles.findByUserId(userId);
    }

    return {
      ...user,
      profile
    };
  }

  // Create user with profile
  async createUserWithProfile(userData, profileData = null) {
    const userId = await this.userAuth.createUser(userData);
    
    if (profileData && userData.role === 'ca') {
      profileData.user_id = userId;
      await this.caProfiles.createCAProfile(profileData);
    } else if (profileData && userData.role === 'analyst') {
      profileData.user_id = userId;
      await this.analystProfiles.createAnalystProfile(profileData);
    }

    // Log the activity
    await this.metadataAnalytics.logActivity({
      user_id: userId,
      activity_type: 'USER_CREATED',
      activity_description: `User ${userData.role} created successfully`
    });

    return userId;
  }

  // Get dashboard data
  async getDashboardData() {
    const [
      userStats,
      caStats,
      analystStats,
      systemStats
    ] = await Promise.all([
      this.userAuth.getUserStats(),
      this.caProfiles.getCAStats(),
      this.analystProfiles.getAnalystStats(),
      this.metadataAnalytics.getSystemStats()
    ]);

    return {
      users: userStats,
      caProfiles: caStats,
      analystProfiles: analystStats,
      system: systemStats
    };
  }

  // Search across all entities
  async globalSearch(searchTerm, limit = 20) {
    const [users, cas, analysts, documents] = await Promise.all([
      this.userAuth.searchUsers(searchTerm, limit),
      this.caProfiles.searchCAProfiles(searchTerm, limit),
      this.analystProfiles.searchAnalystProfiles(searchTerm, limit),
      this.documents.searchDocuments(searchTerm, null, limit)
    ]);

    return {
      users,
      caProfiles: cas,
      analystProfiles: analysts,
      documents
    };
  }
}

// Export individual models and the unified manager
module.exports = {
  UserAuth,
  Documents,
  CAProfiles,
  AnalystProfiles,
  MetadataAnalytics,
  DatabaseManager,
  // Pre-initialized instances
  userAuth,
  documents,
  caProfiles,
  analystProfiles,
  metadataAnalytics,
  // Unified manager instance
  db: new DatabaseManager()
};
