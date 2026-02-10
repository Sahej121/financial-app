const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GSTReport = sequelize.define('GSTReport', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        caId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'CAs',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        financialYear: {
            type: DataTypes.STRING(9),
            allowNull: false,
            comment: 'e.g., 2025-2026'
        },
        status: {
            type: DataTypes.ENUM('draft', 'sent', 'archived'),
            defaultValue: 'sent'
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'gst_reports',
        timestamps: true,
        indexes: [
            { fields: ['caId'] },
            { fields: ['userId'] },
            { fields: ['financialYear'] },
            { fields: ['status'] }
        ]
    });

    GSTReport.associate = (models) => {
        GSTReport.belongsTo(models.CA, {
            foreignKey: 'caId',
            as: 'ca'
        });
        GSTReport.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'client'
        });
    };

    return GSTReport;
};
