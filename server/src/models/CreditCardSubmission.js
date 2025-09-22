const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditCardSubmission = sequelize.define('CreditCardSubmission', {
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
    // Personal Information
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
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Employment Information
    employmentType: {
      type: DataTypes.ENUM('salaried', 'self_employed', 'business_owner', 'freelancer', 'retired', 'student'),
      allowNull: false
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    workExperience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Financial Information
    monthlySpend: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    existingCards: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    creditScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Card Preferences
    cardType: {
      type: DataTypes.JSON, // Array of card types: ['cashback', 'travel', 'rewards', 'fuel', 'shopping']
      allowNull: true
    },
    spendingCategories: {
      type: DataTypes.JSON, // Array of categories: ['online_shopping', 'dining', 'travel', 'fuel', 'groceries', 'entertainment']
      allowNull: true
    },
    bankPreference: {
      type: DataTypes.JSON, // Array of preferred banks
      allowNull: true
    },
    additionalFeatures: {
      type: DataTypes.JSON, // Array of features: ['lounge_access', 'insurance', 'concierge', 'dining_discounts']
      allowNull: true
    },
    // Financial Goals
    primaryPurpose: {
      type: DataTypes.ENUM('rewards', 'cashback', 'travel_benefits', 'building_credit', 'convenience', 'business_expenses'),
      allowNull: true
    },
    annualFeePreference: {
      type: DataTypes.ENUM('free', 'low', 'medium', 'high', 'no_preference'),
      allowNull: true
    },
    // Recommendations Generated
    recommendedCards: {
      type: DataTypes.JSON, // Store the recommended cards data
      allowNull: true
    },
    recommendationScore: {
      type: DataTypes.DECIMAL(3, 2), // Score from 0.00 to 10.00
      allowNull: true
    },
    // Application Status
    status: {
      type: DataTypes.ENUM('submitted', 'recommendations_generated', 'application_initiated', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'submitted'
    },
    appliedCards: {
      type: DataTypes.JSON, // Track which cards user applied for
      allowNull: true
    },
    // Additional Information
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'credit_card_submissions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['employmentType']
      },
      {
        fields: ['monthlyIncome']
      }
    ]
  });

  CreditCardSubmission.associate = (models) => {
    CreditCardSubmission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return CreditCardSubmission;
}; 