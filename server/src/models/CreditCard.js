const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditCard = sequelize.define('CreditCard', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    annualFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    rewardRate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    welcomeOffer: DataTypes.TEXT,
    minIncomeRequired: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    benefits: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('benefits');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('benefits', JSON.stringify(value));
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  CreditCard.associate = (models) => {
    // Add any associations here if needed
  };

  return CreditCard;
}; 