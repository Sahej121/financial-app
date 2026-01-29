const models = require('./src/models');

async function listUsers() {
    try {
        const users = await models.User.findAll({ limit: 5 });
        console.log('--- Sample Users ---');
        users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`));
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();
