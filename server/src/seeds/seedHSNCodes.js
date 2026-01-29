/**
 * Seed HSN Codes
 * Populates the database with common HSN/SAC codes
 */

const { hsnCodes } = require('./hsnCodes');

async function seedHSNCodes(models) {
    const { HSNCode } = models;

    try {
        console.log('[Seed] Starting HSN code seeding...');

        // Check if already seeded
        const existingCount = await HSNCode.count();
        if (existingCount > 0) {
            console.log(`[Seed] HSN codes already exist (${existingCount} records). Skipping.`);
            return { seeded: false, count: existingCount };
        }

        // Bulk create HSN codes
        await HSNCode.bulkCreate(hsnCodes, { ignoreDuplicates: true });

        const newCount = await HSNCode.count();
        console.log(`[Seed] Successfully seeded ${newCount} HSN/SAC codes.`);

        return { seeded: true, count: newCount };
    } catch (error) {
        console.error('[Seed] Error seeding HSN codes:', error);
        throw error;
    }
}

module.exports = { seedHSNCodes };
