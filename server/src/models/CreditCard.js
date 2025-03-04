import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const CreditCard = sequelize.define('CreditCard', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Rewards', 'Cashback', 'Travel', 'Business', 'Student'),
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
    type: DataTypes.ARRAY(DataTypes.STRING)
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

export default CreditCard; 