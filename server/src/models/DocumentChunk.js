const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DocumentChunk = sequelize.define('DocumentChunk', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'documents',
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // We use a vector with 384 dimensions (standard for local all-MiniLM-L6-v2)
        // Note: Sequelize doesn't support vector type natively, so we might need raw queries
        // or a specific definition. For migration, we usually use specific SQL.
        // Here we define it as distinct type if possible, or use raw queries mainly.
        // But for Sequelize syncing, we can try to define it if the dialect supports extensions.
        // For now, we'll keep it as a custom type in raw SQL schema creation
        // or use DataTypes.ARRAY(DataTypes.FLOAT) as a fallback representation
        // We store it as TEXT in Sequelize to bypass specific Array formatting (which uses {})
        // pgvector requires [] format. We will stringify the array before saving.
        embedding: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        chunkIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true, // e.g. { pageNumber: 1, loc: { lines: [10, 20] } }
        }
    }, {
        tableName: 'document_chunks',
        indexes: [
            {
                fields: ['documentId']
            },
            {
                fields: ['submissionId']
            }
        ]
    });

    return DocumentChunk;
};
