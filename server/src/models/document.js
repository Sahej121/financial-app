const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Professional assignment fields
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'Professional (CA/Financial Planner) assigned to review this document'
    },
    
    assignedRole: {
      type: DataTypes.ENUM('ca', 'financial_planner'),
      allowNull: true,
      comment: 'Role of the assigned professional'
    },
    
    // Document status and review
    status: {
      type: DataTypes.ENUM('submitted', 'assigned', 'in_review', 'reviewed', 'approved', 'rejected', 'requires_changes'),
      allowNull: false,
      defaultValue: 'submitted'
    },
    
    category: {
      type: DataTypes.ENUM('tax_documents', 'financial_statements', 'bank_statements', 'invoices', 'receipts', 'contracts', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    
    // Review information
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Professional review notes'
    },
    
    clientNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Client provided notes or description'
    },
    
    // Review tracking
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    
    // File metadata
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    },
    
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  Document.associate = (models) => {
    // Document owner (client)
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });
    
    // Assigned professional (CA/Financial Planner)
    Document.belongsTo(models.User, {
      foreignKey: 'assignedToId',
      as: 'assignedProfessional'
    });
    
    // Documents can be associated with meetings
    Document.belongsToMany(models.Meeting, {
      through: 'MeetingDocuments',
      as: 'meetings',
      foreignKey: 'documentId',
      otherKey: 'meetingId'
    });
  };

  return Document;
}; 