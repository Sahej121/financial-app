const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GSTFiling = sequelize.define('GSTFiling', {
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
        returnType: {
            type: DataTypes.ENUM('GSTR1', 'GSTR3B', 'GSTR9', 'GSTR9C'),
            allowNull: false
        },
        period: {
            type: DataTypes.STRING(6),
            allowNull: false,
            comment: 'MMYYYY format for monthly, or Q1YYYY for quarterly'
        },
        financialYear: {
            type: DataTypes.STRING(9),
            allowNull: false,
            comment: 'e.g., 2025-2026'
        },
        // Status workflow
        status: {
            type: DataTypes.ENUM('draft', 'generated', 'pending_review', 'ca_verified', 'exported', 'filed'),
            defaultValue: 'draft'
        },
        // Important dates
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        generatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        exportedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        filedDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        // Tax liability summary
        taxLiability: {
            type: DataTypes.JSON,
            defaultValue: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
            comment: 'Output tax liability'
        },
        // Input Tax Credit
        itcClaimed: {
            type: DataTypes.JSON,
            defaultValue: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
            comment: 'ITC claimed'
        },
        itcReversed: {
            type: DataTypes.JSON,
            defaultValue: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
            comment: 'ITC reversed (ineligible)'
        },
        // Net payable
        netPayable: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        interestPayable: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        lateFeesPayable: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // GSTR-1 specific summaries
        b2bSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'B2B invoice summary for GSTR-1'
        },
        b2csSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'B2C Small summary'
        },
        b2clSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'B2C Large summary'
        },
        cdnrSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Credit/Debit notes summary'
        },
        exportSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Export invoice summary'
        },
        // CA verification
        caId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'CA who verified the filing'
        },
        caVerifiedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        caComments: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        caSignature: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Base64 signature of the CA'
        },
        // Generated JSON data for portal upload
        jsonData: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Official GSTR JSON format for portal upload'
        },
        // Invoice counts
        invoiceCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalInvoiceValue: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // Acknowledgement from portal (if manually entered)
        arn: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Acknowledgement Reference Number after filing'
        },
        // Notes
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'gst_filings',
        timestamps: true,
        indexes: [
            { fields: ['gstProfileId'] },
            { fields: ['returnType'] },
            { fields: ['period'] },
            { fields: ['status'] },
            { fields: ['dueDate'] },
            { fields: ['caId'] }
        ]
    });

    GSTFiling.associate = (models) => {
        GSTFiling.belongsTo(models.GSTProfile, {
            foreignKey: 'gstProfileId',
            as: 'gstProfile'
        });
        GSTFiling.belongsTo(models.CA, {
            foreignKey: 'caId',
            as: 'verifyingCA'
        });
    };

    return GSTFiling;
};
