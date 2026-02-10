const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DecisionAuditLog = sequelize.define('DecisionAuditLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        submissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'financial_planning_submissions',
                key: 'id'
            }
        },
        eventType: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'e.g. SCORING_DECISION, RULE_EVALUATION'
        },
        confidenceScore: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        executionPath: {
            type: DataTypes.STRING,
            allowNull: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false
        },
        promptVersion: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'V1.0 is default'
        },
        rawInputLen: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Char count of document text sent to AI'
        },
        hallucinationCheck: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: 'True if AI output was cross-verified by deterministic rules'
        },
        performer: {
            type: DataTypes.STRING,
            defaultValue: 'SYSTEM'
        }
    }, {
        tableName: 'decision_audit_logs',
        timestamps: true
    });

    DecisionAuditLog.associate = (models) => {
        DecisionAuditLog.belongsTo(models.FinancialPlanningSubmission, { foreignKey: 'submissionId', as: 'submission' });
    };

    return DecisionAuditLog;
};
