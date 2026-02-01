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

    // ===== MOAT: Purpose Selection =====
    planningPurpose: {
      type: DataTypes.ENUM('investment', 'business_expansion', 'loan_settlement'),
      allowNull: true,
      comment: 'Primary purpose: investment, business expansion, or loan settlement'
    },

    // ===== MOAT: Decision Readiness Scores (0-100) =====
    expansionReadinessScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Business expansion readiness score (0-100)'
    },
    loanSafetyScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Loan safety/repayment capacity score (0-100)'
    },
    investmentCapacityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Investment capacity score (0-100)'
    },
    dataCompletenessScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'How complete is the user data (0-100)'
    },

    // ===== MOAT: Truth Validation =====
    isDataVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether cross-validation passed'
    },
    validationFlags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of validation warnings/red flags from truth layer'
    },

    // ===== MOAT: Decision Pack =====
    decisionPackStatus: {
      type: DataTypes.ENUM('pending', 'generating', 'ready', 'failed'),
      defaultValue: 'pending'
    },
    decisionPackUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to generated decision pack PDF'
    },
    decisionPackGeneratedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    decisionPackData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Full decision pack JSON for dashboard display'
    },

    // ===== MOAT: Business Expansion Fields =====
    expansionType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'new_location, new_product, market_expansion, etc.'
    },
    fundingRequired: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expansionTimeline: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'sole_proprietor, partnership, llp, pvt_ltd, public_ltd'
    },
    industryType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    annualRevenue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employeeCount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profitMargin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cashReserves: {
      type: DataTypes.STRING,
      allowNull: true
    },
    existingLoans: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of existing business loan types'
    },

    // ===== MOAT: Loan Settlement Fields =====
    debtTypes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of debt types: home_loan, personal_loan, etc.'
    },
    totalDebtAmount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    monthlyEMI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    monthlyExpenses: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settlementGoal: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'reduce_emi, debt_free, consolidate, negotiate'
    },
    settlementTimeline: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // ===== MOAT: Analyst Feedback =====
    analystFeedback: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Analyst confirmation/rejection of AI signals'
    },
    outcomeTracking: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Track actual outcomes for ML feedback loop'
    },

    // Step 1: Goal Identification (Legacy primaryGoal removed)
    planningType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'financial_planning'
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    targetTimeline: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Step 2: Time Horizon
    achievementTimeline: {
      type: DataTypes.ENUM('under_1_year', '1_3_years', '3_7_years', 'over_7_years'),
      allowNull: true
    },
    timelineFlexibility: {
      type: DataTypes.ENUM('fixed', 'flexible'),
      allowNull: true
    },

    // Step 3: Risk Profile
    riskReaction: {
      type: DataTypes.ENUM('panic', 'uncomfortable', 'calm'),
      allowNull: true
    },
    investmentExperience: {
      type: DataTypes.ENUM('none', 'beginner', 'experienced'),
      allowNull: true
    },
    riskPreference: {
      type: DataTypes.ENUM('stability', 'balanced', 'aggressive'),
      allowNull: true
    },
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Step 4: Income & Cash Flow
    incomeType: {
      type: DataTypes.ENUM('salaried', 'self_employed', 'business_owner', 'mixed'),
      allowNull: true
    },
    monthlyIncome: {
      type: DataTypes.STRING, // Changed to string for range or specific value
      allowNull: true
    },
    incomeStability: {
      type: DataTypes.ENUM('very_stable', 'stable', 'variable', 'unstable'),
      allowNull: true
    },
    monthlySavings: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },

    // Step 5: Assets Overview (Stored as JSON for flexibility)
    assets: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Includes cash, investments, real assets, employer benefits'
    },

    // Step 6: Liabilities
    liabilities: {
      type: DataTypes.JSON, // activeLoans array
      defaultValue: [],
      comment: 'Array of active loans'
    },
    totalLiabilityAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    highestInterestRate: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    dependents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Step 7: Protection Check
    hasHealthInsurance: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    hasLifeInsurance: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    medicalConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Step 8: Tax Context
    taxResidency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taxBracket: {
      type: DataTypes.STRING,
      allowNull: true
    },
    existingTaxSavingInvestments: {
      type: DataTypes.JSON,
      allowNull: true
    },
    upcomingTaxEvents: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Step 9: Preferences
    avoidedInvestments: {
      type: DataTypes.JSON,
      allowNull: true
    },
    liquidityNeeds: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ethicalPreferences: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exposurePreference: {
      type: DataTypes.ENUM('domestic', 'global', 'mixed'),
      allowNull: true
    },

    // Step 11: Success Definition
    successPriority: {
      type: DataTypes.ENUM('peace_of_mind', 'maximizing_returns', 'predictable_income', 'early_freedom'),
      allowNull: true
    },
    reviewFrequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annually'),
      allowNull: true
    },

    // Step 12: Output/Summary
    riskProfileSummary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    netWorthSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    gapsIdentified: {
      type: DataTypes.JSON,
      allowNull: true
    },
    strategyOutline: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Legacy/Generic fields to keep for backward compatibility or general use
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