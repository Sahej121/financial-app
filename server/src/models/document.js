module.exports = (sequelize, DataTypes) => {
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

  return Document;
}; 