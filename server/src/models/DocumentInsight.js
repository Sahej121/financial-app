const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DocumentInsight = sequelize.define('DocumentInsight', {
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
            },
            comment: 'Link to the financial planning submission this document belongs to'
        },
        insightType: {
            type: DataTypes.ENUM('bank_statement', 'income_proof', 'gst_return', 'itr', 'other'),
            allowNull: false
        },
        extractedData: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'Structured structured financial data extracted by AI'
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        redFlags: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of detected issues or risk patterns'
        },
        confidenceScore: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0
        },
        suggestedFocus: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Recommended discussion points for the analyst'
        },
        highlights: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
            comment: 'Mapping of keys to source snippets and page coordinates { key: { text, page, bbox } }'
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'document_insights',
        timestamps: true
    });

    DocumentInsight.associate = (models) => {
        DocumentInsight.belongsTo(models.Document, {
            foreignKey: 'documentId',
            as: 'document'
        });

        DocumentInsight.belongsTo(models.FinancialPlanningSubmission, {
            foreignKey: 'submissionId',
            as: 'submission'
        });
    };

    return DocumentInsight;
};
