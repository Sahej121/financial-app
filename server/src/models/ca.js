const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CA = sequelize.define('CA', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    caNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 4.5
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    qualifications: {
      type: DataTypes.JSON,
      allowNull: false
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false
    },
    availability: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Available Now'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Reputation System Fields
    trustScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 50.00,
      comment: 'Composite 0-100 score'
    },
    competenceScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    responsivenessScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    outcomeScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    consistencyScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    totalCompletedCases: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    verifiedSpecializations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Specializations with depth scores > threshold'
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['phone'] }
    }
  });

  CA.associate = (models) => {
    // Add any associations if needed
  };

  return CA;
}; 