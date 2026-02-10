const { sequelize } = require('../src/models');

async function resetVectorTable() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();

        console.log('Dropping old document_chunks table...');
        await sequelize.query('DROP TABLE IF EXISTS document_chunks CASCADE');

        console.log('Creating new document_chunks table with vector(384)...');
        // Create table manually to avoid FK issues with missing tables in this script context
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "document_chunks" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "documentId" INTEGER NOT NULL,
                "submissionId" INTEGER,
                "content" TEXT NOT NULL,
                "embedding" vector(384),
                "chunkIndex" INTEGER NOT NULL,
                "metadata" JSONB,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log('✅ Table reset successfully.');
    } catch (error) {
        console.error('❌ Failed to reset table:', error);
    } finally {
        await sequelize.close();
    }
}

resetVectorTable();
