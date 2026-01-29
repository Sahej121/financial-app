const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const HSNCode = sequelize.define('HSNCode', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(8),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('HSN', 'SAC'),
            allowNull: false,
            defaultValue: 'HSN'
        },
        gstRate: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 18,
            comment: 'GST rate in percentage'
        },
        cessRate: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            comment: 'Cess rate in percentage if applicable'
        },
        chapter: {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: 'HSN Chapter number'
        },
        section: {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: 'HSN Section'
        },
        // Categorization for search
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        subCategory: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        // Commonly used flag for quick access
        isCommon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // Search optimization
        searchKeywords: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional keywords for search'
        }
    }, {
        tableName: 'hsn_codes',
        timestamps: true,
        indexes: [
            { fields: ['code'], unique: true },
            { fields: ['type'] },
            { fields: ['gstRate'] },
            { fields: ['isCommon'] },
            { fields: ['category'] }
        ]
    });

    return HSNCode;
};
