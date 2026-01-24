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
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'ca', 'financial_planner', 'admin', 'premium'),
      defaultValue: 'user'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    caNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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