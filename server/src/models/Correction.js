const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Correction = sequelize.define('Correction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Documents',
                key: 'id'
            }
        },
        submissionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'financial_planning_submissions',
                key: 'id'
            }
        },
        fieldName: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'e.g. monthlyIncome, totalCredits'
        },
        originalValue: {
            type: DataTypes.JSON,
            allowNull: true
        },
        correctedValue: {
            type: DataTypes.JSON,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        analystId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'corrections',
        timestamps: true
    });

    Correction.associate = (models) => {
        Correction.belongsTo(models.Document, { foreignKey: 'documentId', as: 'document' });
        Correction.belongsTo(models.FinancialPlanningSubmission, { foreignKey: 'submissionId', as: 'submission' });
    };

    return Correction;
};
