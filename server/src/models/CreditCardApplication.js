const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditCardApplication = sequelize.define('CreditCardApplication', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true
  });

  CreditCardApplication.associate = (models) => {
    CreditCardApplication.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    CreditCardApplication.belongsTo(models.CreditCard, {
      foreignKey: 'cardId',
      as: 'creditCard'
    });
  };

  return CreditCardApplication;
}; 