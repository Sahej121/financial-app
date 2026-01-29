const { sequelize, Document, User } = require('./src/models');

async function testUpload() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Find a professional user
        const user = await User.findOne({ where: { role: 'ca' } }) || await User.findOne({ where: { role: 'financial_planner' } });
        if (!user) {
            console.log('No professional user found to test with.');
            return;
        }

        console.log(`Testing with user: ${user.name} (${user.role}, ID: ${user.id})`);

        const doc = await Document.create({
            fileName: 'test.pdf',
            fileUrl: '/uploads/test.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            userId: user.id,
            category: 'professional_report',
            status: 'submitted',
            uploadedAt: new Date()
        });

        console.log('Document created successfully:', doc.id);
        await doc.destroy();
        console.log('Test doc cleaned up.');

    } catch (error) {
        console.error('Test failed pathologically:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testUpload();
