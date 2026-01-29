const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GSTInvoice = sequelize.define('GSTInvoice', {
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
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Documents',
                key: 'id'
            },
            comment: 'Link to uploaded document if invoice was extracted via OCR'
        },
        invoiceType: {
            type: DataTypes.ENUM('sales', 'purchase'),
            allowNull: false
        },
        invoiceNumber: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        invoiceDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        counterpartyGstin: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        counterpartyName: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        placeOfSupply: {
            type: DataTypes.STRING(2),
            allowNull: false,
            comment: 'State code of place of supply'
        },
        // Line items stored as JSON array
        items: {
            type: DataTypes.JSON,
            defaultValue: [],
            comment: '[{description, hsnSac, quantity, rate, taxableValue, cgst, sgst, igst, cessAmount}]'
        },
        // Totals
        totalTaxableValue: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        totalCgst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        totalSgst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        totalIgst: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        totalCess: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        // Classification
        gstrCategory: {
            type: DataTypes.ENUM('B2B', 'B2CS', 'B2CL', 'CDNR', 'EXP', 'NIL', 'AT', 'TXP'),
            defaultValue: 'B2B',
            comment: 'GSTR-1 category classification'
        },
        // Status tracking
        status: {
            type: DataTypes.ENUM('draft', 'extracted', 'verified', 'finalized', 'cancelled'),
            defaultValue: 'draft'
        },
        // AI extraction metadata
        extractionConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'AI confidence score 0-1 for extracted invoices'
        },
        rawExtractedData: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Original AI extraction for audit trail'
        },
        extractionErrors: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Fields that need manual verification'
        },
        // Filing reference
        gstFilingId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to GSTR filing if included'
        },
        // Additional fields
        reverseCharge: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ecommerceGstin: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Period for filing purposes
        filingPeriod: {
            type: DataTypes.STRING(6),
            allowNull: true,
            comment: 'MMYYYY format'
        }
    }, {
        tableName: 'gst_invoices',
        timestamps: true,
        indexes: [
            { fields: ['gstProfileId'] },
            { fields: ['invoiceType'] },
            { fields: ['invoiceDate'] },
            { fields: ['status'] },
            { fields: ['filingPeriod'] },
            { fields: ['gstrCategory'] },
            { fields: ['documentId'] }
        ]
    });

    GSTInvoice.associate = (models) => {
        GSTInvoice.belongsTo(models.GSTProfile, {
            foreignKey: 'gstProfileId',
            as: 'gstProfile'
        });
        GSTInvoice.belongsTo(models.Document, {
            foreignKey: 'documentId',
            as: 'sourceDocument'
        });
    };

    return GSTInvoice;
};
