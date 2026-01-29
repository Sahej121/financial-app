const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const WealthMonitor = sequelize.define('WealthMonitor', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        merchantName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isAvoidable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        aiAdvice: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rawOcrText: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        itrRelevance: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    WealthMonitor.associate = (models) => {
        WealthMonitor.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return WealthMonitor;
};
