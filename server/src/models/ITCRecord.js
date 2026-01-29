const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ITCRecord = sequelize.define('ITCRecord', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        gstProfileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'gst_profiles',
                key: 'id'
            }
        },
        period: {
            type: DataTypes.STRING(6),
            allowNull: false,
            comment: 'MMYYYY format'
        },
        // Source of ITC data
        source: {
            type: DataTypes.ENUM('GSTR2A', 'GSTR2B', 'purchase_register'),
            allowNull: false
        },
        // Supplier details
        supplierGstin: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        supplierName: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        // Invoice details
        invoiceNumber: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        invoiceDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        invoiceValue: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // Tax details
        taxableValue: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        cgst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        sgst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        igst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        cess: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // Matching status
        matchStatus: {
            type: DataTypes.ENUM('matched', 'unmatched', 'partial', 'mismatch_value', 'mismatch_tax', 'not_in_books'),
            defaultValue: 'unmatched'
        },
        // Linked purchase invoice from our system
        linkedInvoiceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to GSTInvoice if matched'
        },
        // Mismatch details
        mismatchDetails: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Details about what does not match'
        },
        // Eligibility
        isEligible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        ineligibilityReason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Risk scoring for ML
        riskScore: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'ML-predicted risk score 0-1'
        },
        riskFactors: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Factors contributing to risk score'
        },
        // Claimed status
        isClaimed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        claimedInPeriod: {
            type: DataTypes.STRING(6),
            allowNull: true
        }
    }, {
        tableName: 'itc_records',
        timestamps: true,
        indexes: [
            { fields: ['gstProfileId'] },
            { fields: ['period'] },
            { fields: ['source'] },
            { fields: ['supplierGstin'] },
            { fields: ['matchStatus'] },
            { fields: ['isEligible'] }
        ]
    });

    ITCRecord.associate = (models) => {
        ITCRecord.belongsTo(models.GSTProfile, {
            foreignKey: 'gstProfileId',
            as: 'gstProfile'
        });
        ITCRecord.belongsTo(models.GSTInvoice, {
            foreignKey: 'linkedInvoiceId',
            as: 'linkedInvoice'
        });
    };

    return ITCRecord;
};
