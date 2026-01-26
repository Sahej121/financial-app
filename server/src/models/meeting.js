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
    // New intake fields
    engagementPurpose: {
      type: DataTypes.ENUM('tax_filing', 'loan_expansion', 'compliance_cleanup', 'advisory'),
      allowNull: true
    },
    engagementType: {
      type: DataTypes.ENUM('one_time', 'ongoing'),
      allowNull: true
    },
    timeSensitivity: {
      type: DataTypes.ENUM('deadline_driven', 'advisory_only'),
      allowNull: true
    },
    // Business Snapshot (Step 2)
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    turnoverBand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    incomeSources: {
      type: DataTypes.JSON,
      allowNull: true
    },
    accountingMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Risk Assessment (Step 3)
    riskFlags: {
      type: DataTypes.JSON, // { notices: bool, pending: bool, etc }
      allowNull: true
    },
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'financial_planning_submissions',
        key: 'id'
      }
    },
    // Post-Engagement Management (Step 6)
    finalFee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    engagementScope: {
      type: DataTypes.ENUM('one_time', 'monthly_managed'),
      allowNull: true
    },
    engagementNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Post-call details and engagement terms'
    },
    deliverables: {
      type: DataTypes.JSON,
      allowNull: true
    },
    milestones: {
      type: DataTypes.JSON,
      allowNull: true
    },
    pendingStatus: {
      type: DataTypes.ENUM('none', 'client_pending', 'ca_pending'),
      allowNull: false,
      defaultValue: 'none'
    },
    nextFollowUp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    healthScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '0-100 health metrics summary'
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
    // Link to financial planning submission
    Meeting.belongsTo(models.FinancialPlanningSubmission, {
      foreignKey: 'submissionId',
      as: 'submission'
    });
  };

  return Meeting;
};