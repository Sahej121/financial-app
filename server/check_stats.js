const models = require('./src/models');

async function checkData() {
    try {
        console.log('Available Models:', Object.keys(models));

        const hsnCount = models.HSNCode ? await models.HSNCode.count() : 'N/A';
        const caCount = models.CA ? await models.CA.count() : 'N/A';
        const userCount = models.User ? await models.User.count() : 'N/A';
        const gstProfileCount = models.GSTProfile ? await models.GSTProfile.count() : 'N/A';

        console.log('--- Database Stats ---');
        console.log(`HSN Codes: ${hsnCount}`);
        console.log(`CAs: ${caCount}`);
        console.log(`Total Users: ${userCount}`);
        console.log(`GST Profiles: ${gstProfileCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkData();
