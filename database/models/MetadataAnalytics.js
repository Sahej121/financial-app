const { connections } = require('../config');

class MetadataAnalytics {
  constructor() {
    this.db = connections.metadataAnalytics;
  }

  // Store system metadata
  async storeMetadata(entityType, entityId, metadataKey, metadataValue) {
    const query = `
      INSERT INTO system_metadata (entity_type, entity_id, metadata_key, metadata_value)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      metadata_value = VALUES(metadata_value),
      updated_at = CURRENT_TIMESTAMP
    `;
    const [result] = await this.db.execute(query, [entityType, entityId, metadataKey, metadataValue]);
    return result.insertId;
  }

  // Get metadata
  async getMetadata(entityType, entityId, metadataKey = null) {
    let query = 'SELECT * FROM system_metadata WHERE entity_type = ? AND entity_id = ?';
    const params = [entityType, entityId];
    
    if (metadataKey) {
      query += ' AND metadata_key = ?';
      params.push(metadataKey);
    }
    
    const [rows] = await this.db.execute(query, params);
    return metadataKey ? (rows[0] || null) : rows;
  }

  // Log user activity
  async logActivity(activityData) {
    const {
      user_id,
      activity_type,
      activity_description,
      ip_address = null,
      user_agent = null,
      metadata = null
    } = activityData;

    const query = `
      INSERT INTO user_activity_logs (user_id, activity_type, activity_description, ip_address, user_agent, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      user_id, activity_type, activity_description, ip_address, user_agent, JSON.stringify(metadata)
    ]);
    
    return result.insertId;
  }

  // Get user activity logs
  async getUserActivityLogs(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM user_activity_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.execute(query, [userId, limit, offset]);
    return rows;
  }

  // Record performance metric
  async recordMetric(metricData) {
    const {
      metric_name,
      metric_value,
      metric_unit = null,
      entity_type = null,
      entity_id = null
    } = metricData;

    const query = `
      INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, entity_type, entity_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      metric_name, metric_value, metric_unit, entity_type, entity_id
    ]);
    
    return result.insertId;
  }

  // Get performance metrics
  async getMetrics(metricName = null, entityType = null, entityId = null, limit = 100) {
    let query = 'SELECT * FROM performance_metrics WHERE 1=1';
    const params = [];
    
    if (metricName) {
      query += ' AND metric_name = ?';
      params.push(metricName);
    }
    
    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }
    
    if (entityId) {
      query += ' AND entity_id = ?';
      params.push(entityId);
    }
    
    query += ' ORDER BY recorded_at DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  // Log audit trail
  async logAudit(auditData) {
    const {
      table_name,
      record_id,
      action,
      old_values = null,
      new_values = null,
      changed_by = null
    } = auditData;

    const query = `
      INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await this.db.execute(query, [
      table_name, record_id, action, JSON.stringify(old_values), JSON.stringify(new_values), changed_by
    ]);
    
    return result.insertId;
  }

  // Get audit logs
  async getAuditLogs(tableName = null, recordId = null, limit = 100) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    
    if (tableName) {
      query += ' AND table_name = ?';
      params.push(tableName);
    }
    
    if (recordId) {
      query += ' AND record_id = ?';
      params.push(recordId);
    }
    
    query += ' ORDER BY changed_at DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  // Get system statistics
  async getSystemStats() {
    const query = `
      SELECT 
        'users' as entity_type,
        COUNT(*) as count
      FROM user_auth_db.users
      UNION ALL
      SELECT 
        'documents' as entity_type,
        COUNT(*) as count
      FROM documents_db.documents
      UNION ALL
      SELECT 
        'ca_profiles' as entity_type,
        COUNT(*) as count
      FROM ca_profiles_db.ca_profiles
      UNION ALL
      SELECT 
        'analyst_profiles' as entity_type,
        COUNT(*) as count
      FROM analyst_profiles_db.analyst_profiles
    `;
    const [rows] = await this.db.execute(query);
    return rows;
  }

  // Clean up old logs
  async cleanupOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const queries = [
      'DELETE FROM user_activity_logs WHERE created_at < ?',
      'DELETE FROM performance_metrics WHERE recorded_at < ?',
      'DELETE FROM audit_logs WHERE changed_at < ?'
    ];
    
    let totalDeleted = 0;
    for (const query of queries) {
      const [result] = await this.db.execute(query, [cutoffDate]);
      totalDeleted += result.affectedRows;
    }
    
    return totalDeleted;
  }
}

module.exports = MetadataAnalytics;
