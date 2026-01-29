const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GSTProfile = sequelize.define('GSTProfile', {
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
        gstin: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
            }
        },
        businessName: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        legalName: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        businessType: {
            type: DataTypes.ENUM('proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'trust', 'society', 'government'),
            allowNull: true
        },
        registrationDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        filingFrequency: {
            type: DataTypes.ENUM('monthly', 'quarterly'),
            defaultValue: 'monthly'
        },
        state: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        stateCode: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        turnoverCategory: {
            type: DataTypes.ENUM('below_1_5cr', '1_5_to_5cr', '5_to_10cr', 'above_10cr'),
            allowNull: true
        },
        isComposition: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        pan: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true
        }
    }, {
        tableName: 'gst_profiles',
        timestamps: true,
        indexes: [
            { fields: ['userId'] },
            { fields: ['gstin'], unique: true },
            { fields: ['state'] }
        ]
    });

    GSTProfile.associate = (models) => {
        GSTProfile.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        GSTProfile.hasMany(models.GSTInvoice, {
            foreignKey: 'gstProfileId',
            as: 'invoices'
        });
        GSTProfile.hasMany(models.GSTFiling, {
            foreignKey: 'gstProfileId',
            as: 'filings'
        });
    };

    return GSTProfile;
};
