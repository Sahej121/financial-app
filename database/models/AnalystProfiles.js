const { connections } = require('../config');

class AnalystProfiles {
  constructor() {
    this.db = connections.analystProfiles;
  }

  // Create a new analyst profile
  async createAnalystProfile(analystData) {
    const {
      user_id,
      analyst_id,
      name,
      email,
      phone = null,
      alternate_phone = null,
      profile_picture = null,
      bio = null,
      experience_years = 0,
      consultation_fee,
      is_verified = false
    } = analystData;

    const query = `
      INSERT INTO analyst_profiles (
        user_id, analyst_id, name, email, phone, alternate_phone, 
        profile_picture, bio, experience_years, consultation_fee, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      user_id, analyst_id, name, email, phone, alternate_phone,
      profile_picture, bio, experience_years, consultation_fee, is_verified
    ]);
    
    return result.insertId;
  }

  // Get analyst profile by ID
  async findById(id) {
    const query = 'SELECT * FROM analyst_profiles WHERE id = ?';
    const [rows] = await this.db.execute(query, [id]);
    return rows[0] || null;
  }

  // Get analyst profile by user ID
  async findByUserId(userId) {
    const query = 'SELECT * FROM analyst_profiles WHERE user_id = ?';
    const [rows] = await this.db.execute(query, [userId]);
    return rows[0] || null;
  }

  // Get analyst profile by analyst ID
  async findByAnalystId(analystId) {
    const query = 'SELECT * FROM analyst_profiles WHERE analyst_id = ?';
    const [rows] = await this.db.execute(query, [analystId]);
    return rows[0] || null;
  }

  // Get all analyst profiles
  async getAllAnalystProfiles(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM analyst_profiles 
      WHERE is_active = TRUE 
      ORDER BY rating DESC, total_consultations DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [limit, offset]);
    return rows;
  }

  // Get verified analyst profiles
  async getVerifiedAnalystProfiles(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM analyst_profiles 
      WHERE is_verified = TRUE AND is_active = TRUE 
      ORDER BY rating DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [limit, offset]);
    return rows;
  }

  // Update analyst profile
  async updateAnalystProfile(id, updateData) {
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
    const query = `UPDATE analyst_profiles SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await this.db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Update analyst rating
  async updateRating(id, newRating) {
    const query = `
      UPDATE analyst_profiles 
      SET rating = ?, total_consultations = total_consultations + 1 
      WHERE id = ?
    `;
    const [result] = await this.db.execute(query, [newRating, id]);
    return result.affectedRows > 0;
  }

  // Add specialization
  async addSpecialization(analystId, specialization, proficiencyLevel = 'intermediate', yearsExperience = 0) {
    const query = `
      INSERT INTO analyst_specializations (analyst_id, specialization, proficiency_level, years_experience)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      proficiency_level = VALUES(proficiency_level),
      years_experience = VALUES(years_experience)
    `;
    const [result] = await this.db.execute(query, [analystId, specialization, proficiencyLevel, yearsExperience]);
    return result.insertId;
  }

  // Get analyst specializations
  async getSpecializations(analystId) {
    const query = 'SELECT * FROM analyst_specializations WHERE analyst_id = ?';
    const [rows] = await this.db.execute(query, [analystId]);
    return rows;
  }

  // Add qualification
  async addQualification(qualificationData) {
    const {
      analyst_id,
      qualification_name,
      issuing_authority = null,
      issue_date = null,
      expiry_date = null,
      certificate_number = null,
      certificate_url = null,
      is_verified = false
    } = qualificationData;

    const query = `
      INSERT INTO analyst_qualifications (
        analyst_id, qualification_name, issuing_authority, issue_date, 
        expiry_date, certificate_number, certificate_url, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      analyst_id, qualification_name, issuing_authority, issue_date,
      expiry_date, certificate_number, certificate_url, is_verified
    ]);
    
    return result.insertId;
  }

  // Get analyst qualifications
  async getQualifications(analystId) {
    const query = 'SELECT * FROM analyst_qualifications WHERE analyst_id = ? ORDER BY issue_date DESC';
    const [rows] = await this.db.execute(query, [analystId]);
    return rows;
  }

  // Add language
  async addLanguage(analystId, language, proficiency = 'conversational') {
    const query = `
      INSERT INTO analyst_languages (analyst_id, language, proficiency)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)
    `;
    const [result] = await this.db.execute(query, [analystId, language, proficiency]);
    return result.insertId;
  }

  // Get analyst languages
  async getLanguages(analystId) {
    const query = 'SELECT * FROM analyst_languages WHERE analyst_id = ?';
    const [rows] = await this.db.execute(query, [analystId]);
    return rows;
  }

  // Set availability
  async setAvailability(analystId, dayOfWeek, startTime, endTime, isAvailable = true) {
    const query = `
      INSERT INTO analyst_availability (analyst_id, day_of_week, start_time, end_time, is_available)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      is_available = VALUES(is_available)
    `;
    const [result] = await this.db.execute(query, [analystId, dayOfWeek, startTime, endTime, isAvailable]);
    return result.insertId;
  }

  // Get analyst availability
  async getAvailability(analystId) {
    const query = 'SELECT * FROM analyst_availability WHERE analyst_id = ? ORDER BY day_of_week';
    const [rows] = await this.db.execute(query, [analystId]);
    return rows;
  }

  // Add review
  async addReview(reviewData) {
    const {
      analyst_id,
      client_id,
      rating,
      review_text = null,
      consultation_id = null,
      is_verified = false
    } = reviewData;

    const query = `
      INSERT INTO analyst_reviews (analyst_id, client_id, rating, review_text, consultation_id, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      analyst_id, client_id, rating, review_text, consultation_id, is_verified
    ]);
    
    // Update analyst rating
    await this.updateAverageRating(analyst_id);
    
    return result.insertId;
  }

  // Get analyst reviews
  async getReviews(analystId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM analyst_reviews 
      WHERE analyst_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [analystId, limit, offset]);
    return rows;
  }

  // Update average rating
  async updateAverageRating(analystId) {
    const query = `
      UPDATE analyst_profiles 
      SET rating = (
        SELECT AVG(rating) FROM analyst_reviews WHERE analyst_id = ?
      )
      WHERE id = ?
    `;
    const [result] = await this.db.execute(query, [analystId, analystId]);
    return result.affectedRows > 0;
  }

  // Search analyst profiles
  async searchAnalystProfiles(searchTerm, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM analyst_profiles 
      WHERE (name LIKE ? OR email LIKE ? OR bio LIKE ?) 
      AND is_active = TRUE 
      ORDER BY rating DESC 
      LIMIT ? OFFSET ?
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await this.db.execute(query, [searchPattern, searchPattern, searchPattern, limit, offset]);
    return rows;
  }

  // Get analyst statistics
  async getAnalystStats() {
    const query = `
      SELECT 
        COUNT(*) as total_analysts,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_analysts,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_analysts,
        AVG(rating) as avg_rating,
        AVG(consultation_fee) as avg_fee,
        AVG(experience_years) as avg_experience
      FROM analyst_profiles
    `;
    const [rows] = await this.db.execute(query);
    return rows[0];
  }
}

module.exports = AnalystProfiles;
