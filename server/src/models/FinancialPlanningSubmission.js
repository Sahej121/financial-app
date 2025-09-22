const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialPlanningSubmission = sequelize.define('FinancialPlanningSubmission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Basic Information
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    // Financial Goals
    planningType: {
      type: DataTypes.ENUM('business', 'loan', 'investment', 'retirement', 'tax_planning', 'insurance'),
      allowNull: false
    },
    goalDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    timeframe: {
      type: DataTypes.STRING,
      allowNull: true
    },
    riskTolerance: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true
    },
    // Business-specific fields
    businessType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentRevenue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    expansionGoal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    // Loan-specific fields
    loanType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    currentEMI: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    // Investment preferences
    investmentExperience: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'experienced'),
      allowNull: true
    },
    preferredInvestments: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Additional information
    existingInvestments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Consultation details
    consultationSlot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    preferredMeetingType: {
      type: DataTypes.ENUM('video', 'phone', 'in_person'),
      allowNull: true
    },
    // Status tracking
    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'consultation_scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'submitted'
    },
    assignedAnalyst: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'financial_planning_submissions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['planningType']
      }
    ]
  });

  FinancialPlanningSubmission.associate = (models) => {
    FinancialPlanningSubmission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return FinancialPlanningSubmission;
}; 