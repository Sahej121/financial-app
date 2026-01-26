const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        meetingId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'meetings',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'e.g. DOCUMENT_UPLOAD, STATUS_CHANGE, FEE_QUOTE'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'activity_logs',
        timestamps: true
    });

    ActivityLog.associate = (models) => {
        ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        ActivityLog.belongsTo(models.Meeting, { foreignKey: 'meetingId', as: 'meeting' });
    };

    return ActivityLog;
};
