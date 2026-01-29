const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Changed to true to support social login
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('user', 'ca', 'financial_planner', 'admin', 'premium'),
      defaultValue: 'user'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Situational Clarity Fields
    clientType: {
      type: DataTypes.ENUM('individual', 'proprietor', 'partnership', 'pvt_ltd', 'llp'),
      allowNull: true
    },
    residentStatus: {
      type: DataTypes.ENUM('resident', 'nri', 'rnor'),
      allowNull: true
    },
    pan: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Masked in UI'
    },
    aadhaar: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Masked in UI'
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Structured Business Understanding (Step 2)
    industry: {
      type: DataTypes.ENUM('manufacturing', 'services', 'trading', 'gig', 'salaried', 'other'),
      allowNull: true
    },
    turnoverBand: {
      type: DataTypes.ENUM('under_20l', '20l_2cr', '2cr_10cr', 'over_10cr'),
      allowNull: true
    },
    incomeSources: {
      type: DataTypes.JSON, // Array of selected sources
      allowNull: true
    },
    accountingMethod: {
      type: DataTypes.ENUM('cash', 'accrual', 'unknown'),
      allowNull: true
    },
    // Risk Assessment Fields (Step 3)
    hasPastNotices: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasPendingFilings: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasLoans: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasCryptoForeignAssets: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isCashHeavy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    riskScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '0-100 logic-based risk score'
    },
    caNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    marketingEmails: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    darkTheme: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'documents'
    });
  };

  return User;
}; 