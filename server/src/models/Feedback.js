const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Feedback = sequelize.define('Feedback', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        feedbackType: {
            type: DataTypes.ENUM('suggestion', 'compliment', 'complaint', 'bug-report', 'feature-request', 'other'),
            allowNull: false,
            defaultValue: 'other'
        },
        service: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        source: {
            type: DataTypes.STRING,
            defaultValue: 'web'
        },
        status: {
            type: DataTypes.ENUM('new', 'reviewed', 'actioned', 'archived'),
            defaultValue: 'new'
        }
    }, {
        tableName: 'feedbacks',
        timestamps: true
    });

    Feedback.associate = (models) => {
        Feedback.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Feedback;
};
