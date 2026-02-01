const { User } = require('../src/models');

async function testQuery() {
    console.log('--- STARTING DB DIAGNOSTIC ---');
    try {
        const user = await User.findOne({
            attributes: ['id', 'email', 'otpCode']
        });
        console.log('Query successful!');
        console.log('User found:', user ? user.email : 'No users in DB');
        console.log('otpCode value:', user ? user.otpCode : 'N/A');
        console.log('--- DIAGNOSTIC COMPLETED ---');
        process.exit(0);
    } catch (error) {
        console.error('--- DIAGNOSTIC FAILED ---');
        console.error(error.message);
        if (error.sql) {
            console.log('SQL attempted:', error.sql);
        }
        process.exit(1);
    }
}

testQuery();
