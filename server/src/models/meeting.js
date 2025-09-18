const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meeting = sequelize.define('Meeting', {
    // Client information
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Professional assignment
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id'
      }
    },
    
    professionalRole: {
      type: DataTypes.ENUM('ca', 'financial_planner'),
      allowNull: false
    },
    
    // Meeting details
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Financial Consultation'
    },
    
    planningType: {
      type: DataTypes.ENUM('business', 'loan', 'investment', 'tax_planning', 'financial_planning'),
      allowNull: false,
      defaultValue: 'financial_planning'
    },
    
    // Meeting scheduling
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    
    // Meeting status
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    
    // Zoom integration
    zoomMeetingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    zoomJoinUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    zoomStartUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    zoomPassword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Additional information
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Professional notes about the meeting'
    },
    
    clientNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Client provided notes or requirements'
    },
    
    // Completion tracking
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'meetings',
    timestamps: true
  });

  Meeting.associate = (models) => {
    // Client relationship
    Meeting.belongsTo(models.User, {
      as: 'client',
      foreignKey: 'clientId'
    });
    
    // Professional relationship  
    Meeting.belongsTo(models.User, {
      as: 'professional',
      foreignKey: 'professionalId'
    });
    
    // Documents relationship (many meetings can have many documents)
    Meeting.belongsToMany(models.Document, {
      through: 'MeetingDocuments',
      as: 'documents',
      foreignKey: 'meetingId',
      otherKey: 'documentId'
    });
  };

  return Meeting;
};