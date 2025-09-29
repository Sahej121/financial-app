const { connections } = require('../config');

class UserAuth {
  constructor() {
    this.db = connections.userAuth;
  }

  // Create a new user
  async createUser(userData) {
    const {
      name,
      email,
      password_hash,
      salt,
      role = 'user',
      verification_token = null
    } = userData;

    const query = `
      INSERT INTO users (name, email, password_hash, salt, role, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      name, email, password_hash, salt, role, verification_token
    ]);
    
    return result.insertId;
  }

  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await this.db.execute(query, [email]);
    return rows[0] || null;
  }

  // Find user by ID
  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await this.db.execute(query, [id]);
    return rows[0] || null;
  }

  // Update user
  async updateUser(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await this.db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Update last login
  async updateLastLogin(id, ipAddress = null) {
    const query = `
      UPDATE users 
      SET last_login = NOW(), login_attempts = 0, locked_until = NULL 
      WHERE id = ?
    `;
    await this.db.execute(query, [id]);
  }

  // Increment login attempts
  async incrementLoginAttempts(email) {
    const query = `
      UPDATE users 
      SET login_attempts = login_attempts + 1,
          locked_until = CASE 
            WHEN login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            ELSE locked_until
          END
      WHERE email = ?
    `;
    await this.db.execute(query, [email]);
  }

  // Verify user email
  async verifyUser(token) {
    const query = `
      UPDATE users 
      SET is_verified = TRUE, verification_token = NULL 
      WHERE verification_token = ? AND is_verified = FALSE
    `;
    const [result] = await this.db.execute(query, [token]);
    return result.affectedRows > 0;
  }

  // Create OAuth provider record
  async createOAuthProvider(userId, provider, providerId, providerData = null) {
    const query = `
      INSERT INTO oauth_providers (user_id, provider, provider_id, provider_data)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await this.db.execute(query, [
      userId, provider, providerId, JSON.stringify(providerData)
    ]);
    return result.insertId;
  }

  // Find user by OAuth provider
  async findByOAuthProvider(provider, providerId) {
    const query = `
      SELECT u.* FROM users u
      JOIN oauth_providers o ON u.id = o.user_id
      WHERE o.provider = ? AND o.provider_id = ?
    `;
    const [rows] = await this.db.execute(query, [provider, providerId]);
    return rows[0] || null;
  }

  // Create user session
  async createSession(userId, sessionToken, expiresAt, ipAddress = null, userAgent = null) {
    const query = `
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute(query, [
      userId, sessionToken, expiresAt, ipAddress, userAgent
    ]);
    return result.insertId;
  }

  // Find session by token
  async findSessionByToken(token) {
    const query = `
      SELECT s.*, u.* FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > NOW() AND s.is_active = TRUE
    `;
    const [rows] = await this.db.execute(query, [token]);
    return rows[0] || null;
  }

  // Deactivate session
  async deactivateSession(token) {
    const query = 'UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?';
    const [result] = await this.db.execute(query, [token]);
    return result.affectedRows > 0;
  }

  // Clean expired sessions
  async cleanExpiredSessions() {
    const query = 'DELETE FROM user_sessions WHERE expires_at < NOW()';
    const [result] = await this.db.execute(query);
    return result.affectedRows;
  }

  // Get users by role
  async getUsersByRole(role, limit = 50, offset = 0) {
    const query = `
      SELECT id, name, email, role, is_active, is_verified, created_at, last_login
      FROM users 
      WHERE role = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [role, limit, offset]);
    return rows;
  }

  // Search users
  async searchUsers(searchTerm, limit = 50, offset = 0) {
    const query = `
      SELECT id, name, email, role, is_active, is_verified, created_at
      FROM users 
      WHERE name LIKE ? OR email LIKE ?
      ORDER BY name ASC 
      LIMIT ? OFFSET ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await this.db.execute(query, [searchPattern, searchPattern, limit, offset]);
    return rows;
  }

  // Get user statistics
  async getUserStats() {
    const query = `
      SELECT 
        role,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
      FROM users 
      GROUP BY role
    `;
    const [rows] = await this.db.execute(query);
    return rows;
  }
}

module.exports = UserAuth;
