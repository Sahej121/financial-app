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
    }
  });

  CA.associate = (models) => {
    // Add any associations if needed
  };

  return CA;
}; 