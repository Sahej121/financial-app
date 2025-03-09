const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CA = sequelize.define('CA', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    specialization: {
      type: DataTypes.STRING
    }
  });

  CA.associate = (models) => {
    // Add any associations if needed
  };

  return CA;
}; 