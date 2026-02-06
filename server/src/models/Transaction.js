const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
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
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.INTEGER, // Storing in smallest currency unit (paise)
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'INR'
        },
        status: {
            type: DataTypes.ENUM('created', 'paid', 'failed', 'refunded'),
            defaultValue: 'created'
        },
        purpose: {
            type: DataTypes.STRING, // e.g., 'financial_planning_insights', 'consultation_fe'
            allowNull: false
        },
        referenceId: {
            type: DataTypes.INTEGER, // ID of the related entity (Submission ID or Meeting ID, potentially)
            allowNull: true,
            comment: 'ID of the related resource (Submission, Meeting, etc.)'
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'transactions',
        timestamps: true
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return Transaction;
};
