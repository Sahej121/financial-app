const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Document;
}; 