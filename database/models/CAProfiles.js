const { connections } = require('../config');

class CAProfiles {
  constructor() {
    this.db = connections.caProfiles;
  }

  // Create a new CA profile
  async createCAProfile(caData) {
    const {
      user_id,
      ca_number,
      name,
      email,
      phone = null,
      alternate_phone = null,
      profile_picture = null,
      bio = null,
      experience_years = 0,
      consultation_fee,
      is_verified = false
    } = caData;

    const query = `
      INSERT INTO ca_profiles (
        user_id, ca_number, name, email, phone, alternate_phone, 
        profile_picture, bio, experience_years, consultation_fee, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      user_id, ca_number, name, email, phone, alternate_phone,
      profile_picture, bio, experience_years, consultation_fee, is_verified
    ]);
    
    return result.insertId;
  }

  // Get CA profile by ID
  async findById(id) {
    const query = 'SELECT * FROM ca_profiles WHERE id = ?';
    const [rows] = await this.db.execute(query, [id]);
    return rows[0] || null;
  }

  // Get CA profile by user ID
  async findByUserId(userId) {
    const query = 'SELECT * FROM ca_profiles WHERE user_id = ?';
    const [rows] = await this.db.execute(query, [userId]);
    return rows[0] || null;
  }

  // Get CA profile by CA number
  async findByCANumber(caNumber) {
    const query = 'SELECT * FROM ca_profiles WHERE ca_number = ?';
    const [rows] = await this.db.execute(query, [caNumber]);
    return rows[0] || null;
  }

  // Get all CA profiles
  async getAllCAProfiles(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM ca_profiles 
      WHERE is_active = TRUE 
      ORDER BY rating DESC, total_consultations DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [limit, offset]);
    return rows;
  }

  // Get verified CA profiles
  async getVerifiedCAProfiles(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM ca_profiles 
      WHERE is_verified = TRUE AND is_active = TRUE 
      ORDER BY rating DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [limit, offset]);
    return rows;
  }

  // Update CA profile
  async updateCAProfile(id, updateData) {
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
    const query = `UPDATE ca_profiles SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await this.db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Update CA rating
  async updateRating(id, newRating) {
    const query = `
      UPDATE ca_profiles 
      SET rating = ?, total_consultations = total_consultations + 1 
      WHERE id = ?
    `;
    const [result] = await this.db.execute(query, [newRating, id]);
    return result.affectedRows > 0;
  }

  // Add specialization
  async addSpecialization(caId, specialization, proficiencyLevel = 'intermediate', yearsExperience = 0) {
    const query = `
      INSERT INTO ca_specializations (ca_id, specialization, proficiency_level, years_experience)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      proficiency_level = VALUES(proficiency_level),
      years_experience = VALUES(years_experience)
    `;
    const [result] = await this.db.execute(query, [caId, specialization, proficiencyLevel, yearsExperience]);
    return result.insertId;
  }

  // Get CA specializations
  async getSpecializations(caId) {
    const query = 'SELECT * FROM ca_specializations WHERE ca_id = ?';
    const [rows] = await this.db.execute(query, [caId]);
    return rows;
  }

  // Add qualification
  async addQualification(qualificationData) {
    const {
      ca_id,
      qualification_name,
      issuing_authority = null,
      issue_date = null,
      expiry_date = null,
      certificate_number = null,
      certificate_url = null,
      is_verified = false
    } = qualificationData;

    const query = `
      INSERT INTO ca_qualifications (
        ca_id, qualification_name, issuing_authority, issue_date, 
        expiry_date, certificate_number, certificate_url, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      ca_id, qualification_name, issuing_authority, issue_date,
      expiry_date, certificate_number, certificate_url, is_verified
    ]);
    
    return result.insertId;
  }

  // Get CA qualifications
  async getQualifications(caId) {
    const query = 'SELECT * FROM ca_qualifications WHERE ca_id = ? ORDER BY issue_date DESC';
    const [rows] = await this.db.execute(query, [caId]);
    return rows;
  }

  // Add language
  async addLanguage(caId, language, proficiency = 'conversational') {
    const query = `
      INSERT INTO ca_languages (ca_id, language, proficiency)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)
    `;
    const [result] = await this.db.execute(query, [caId, language, proficiency]);
    return result.insertId;
  }

  // Get CA languages
  async getLanguages(caId) {
    const query = 'SELECT * FROM ca_languages WHERE ca_id = ?';
    const [rows] = await this.db.execute(query, [caId]);
    return rows;
  }

  // Set availability
  async setAvailability(caId, dayOfWeek, startTime, endTime, isAvailable = true) {
    const query = `
      INSERT INTO ca_availability (ca_id, day_of_week, start_time, end_time, is_available)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      is_available = VALUES(is_available)
    `;
    const [result] = await this.db.execute(query, [caId, dayOfWeek, startTime, endTime, isAvailable]);
    return result.insertId;
  }

  // Get CA availability
  async getAvailability(caId) {
    const query = 'SELECT * FROM ca_availability WHERE ca_id = ? ORDER BY day_of_week';
    const [rows] = await this.db.execute(query, [caId]);
    return rows;
  }

  // Add review
  async addReview(reviewData) {
    const {
      ca_id,
      client_id,
      rating,
      review_text = null,
      consultation_id = null,
      is_verified = false
    } = reviewData;

    const query = `
      INSERT INTO ca_reviews (ca_id, client_id, rating, review_text, consultation_id, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      ca_id, client_id, rating, review_text, consultation_id, is_verified
    ]);
    
    // Update CA rating
    await this.updateAverageRating(ca_id);
    
    return result.insertId;
  }

  // Get CA reviews
  async getReviews(caId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM ca_reviews 
      WHERE ca_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [caId, limit, offset]);
    return rows;
  }

  // Update average rating
  async updateAverageRating(caId) {
    const query = `
      UPDATE ca_profiles 
      SET rating = (
        SELECT AVG(rating) FROM ca_reviews WHERE ca_id = ?
      )
      WHERE id = ?
    `;
    const [result] = await this.db.execute(query, [caId, caId]);
    return result.affectedRows > 0;
  }

  // Search CA profiles
  async searchCAProfiles(searchTerm, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM ca_profiles 
      WHERE (name LIKE ? OR email LIKE ? OR bio LIKE ?) 
      AND is_active = TRUE 
      ORDER BY rating DESC 
      LIMIT ? OFFSET ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await this.db.execute(query, [searchPattern, searchPattern, searchPattern, limit, offset]);
    return rows;
  }

  // Get CA statistics
  async getCAStats() {
    const query = `
      SELECT 
        COUNT(*) as total_cas,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_cas,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_cas,
        AVG(rating) as avg_rating,
        AVG(consultation_fee) as avg_fee,
        AVG(experience_years) as avg_experience
      FROM ca_profiles
    `;
    const [rows] = await this.db.execute(query);
    return rows[0];
  }
}

module.exports = CAProfiles;
