const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FinancialPlanner = sequelize.define('FinancialPlanner', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        qualifications: {
            type: DataTypes.JSON, // Array of strings
            allowNull: false
        },
        specializations: {
            type: DataTypes.JSON, // Array of strings (e.g., "Stocks", "Retirement")
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        languages: {
            type: DataTypes.JSON,
            allowNull: false
        },
        availability: {
            type: DataTypes.STRING,
            defaultValue: 'Available Now'
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 4.8
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        // Reputation System Fields
        trustScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 50.00,
            comment: 'Composite 0-100 score'
        },
        competenceScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        responsivenessScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        outcomeScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        consistencyScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        verifiedSpecializations: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Specializations with depth scores > threshold'
        },
        // Analyst specific fields
        aum: {
            type: DataTypes.DECIMAL(15, 2), // Assets Under Management (Mock)
            defaultValue: 0
        },
        clientsManaged: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        defaultScope: {
            attributes: { exclude: ['phone'] }
        }
    });

    FinancialPlanner.associate = (models) => {
        // Add associations here if needed (e.g., to Users who are clients)
    };

    return FinancialPlanner;
};
