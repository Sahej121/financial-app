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
      type: DataTypes.STRING,
      defaultValue: '0'
    },
    rewardRate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    welcomeOffer: DataTypes.TEXT,
    minIncomeRequired: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    benefits: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('benefits');
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch (e) {
          return rawValue ? rawValue.split(',') : [];
        }
      },
      set(value) {
        this.setDataValue('benefits', typeof value === 'string' ? value : JSON.stringify(value));
      }
    },
    ratings: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('ratings');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('ratings', JSON.stringify(value));
      }
    },
    eligibility: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('eligibility');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('eligibility', JSON.stringify(value));
      }
    },
    specialRemarks: DataTypes.TEXT,
    applicationUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hiddenCharges: {
      type: DataTypes.TEXT,
      allowNull: true
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