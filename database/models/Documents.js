const { connections } = require('../config');

class Documents {
  constructor() {
    this.db = connections.documents;
  }

  // Create a new document
  async createDocument(documentData) {
    const {
      user_id,
      file_name,
      original_name,
      file_path,
      file_url = null,
      file_type,
      file_size,
      mime_type,
      category = 'other',
      priority = 'medium',
      description = null,
      tags = null,
      metadata = null,
      checksum = null,
      expires_at = null
    } = documentData;

    const query = `
      INSERT INTO documents (
        user_id, file_name, original_name, file_path, file_url, file_type, 
        file_size, mime_type, category, priority, description, tags, 
        metadata, checksum, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      user_id, file_name, original_name, file_path, file_url, file_type,
      file_size, mime_type, category, priority, description, 
      JSON.stringify(tags), JSON.stringify(metadata), checksum, expires_at
    ]);
    
    return result.insertId;
  }

  // Get document by ID
  async findById(id) {
    const query = 'SELECT * FROM documents WHERE id = ?';
    const [rows] = await this.db.execute(query, [id]);
    return rows[0] || null;
  }

  // Get documents by user ID
  async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM documents 
      WHERE user_id = ? 
      ORDER BY uploaded_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [userId, limit, offset]);
    return rows;
  }

  // Update document
  async updateDocument(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'tags' || key === 'metadata') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await this.db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Search documents
  async searchDocuments(searchTerm, userId = null, limit = 50, offset = 0) {
    let query = `
      SELECT * FROM documents 
      WHERE (file_name LIKE ? OR original_name LIKE ? OR description LIKE ?)
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY uploaded_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await this.db.execute(query, params);
    return rows;
  }
}

module.exports = Documents;
