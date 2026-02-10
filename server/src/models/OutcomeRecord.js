const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OutcomeRecord = sequelize.define('OutcomeRecord', {
        // Relationships
        analystId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            comment: 'ID of the professional providing advice'
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
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
        meetingId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'meetings',
                key: 'id'
            }
        },

        // Advice Details
        adviceType: {
            type: DataTypes.ENUM('tax_planning', 'investment', 'debt_management', 'compliance', 'other'),
            allowNull: false
        },
        adviceSummary: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        // Outcome Metrics
        expectedOutcomeDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        actualOutcomeDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        financialImpact: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Measured financial benefit (savings or gain)'
        },
        outcomeScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 10 },
            comment: '1-10 rating of result quality'
        },

        // Verification
        clientConfirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        clientFeedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        // System Metadata
        status: {
            type: DataTypes.ENUM('pending', 'verified', 'disputed'),
            defaultValue: 'pending'
        }
    }, {
        tableName: 'outcome_records',
        timestamps: true
    });

    OutcomeRecord.associate = (models) => {
        OutcomeRecord.belongsTo(models.User, { as: 'analyst', foreignKey: 'analystId' });
        OutcomeRecord.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
        OutcomeRecord.belongsTo(models.Meeting, { as: 'meeting', foreignKey: 'meetingId' });
        OutcomeRecord.belongsTo(models.FinancialPlanningSubmission, { as: 'submission', foreignKey: 'submissionId' });
    };

    return OutcomeRecord;
};
