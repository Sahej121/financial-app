// Test: Security Vulnerabilities
const request = require('supertest');
const app = require('../src/index'); // Note: index.js needs to export app for testing
const { User, sequelize } = require('../src/models');

describe('Security Hardening Tests', () => {
    beforeAll(async () => {
        // Ensure DB is synced or connected
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Registration Role Restriction', () => {
        it('should reject registration with admin role', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Attacker',
                    email: 'attacker@example.com',
                    password: 'Stronger!Password#2026',
                    role: 'admin'
                });

            if (res.status !== 403) console.log('Reject Admin Response:', res.body);
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Forbidden');
        });

        it('should allow registration with user role', async () => {
            // Clean up if user exists
            await User.destroy({ where: { email: 'legit@example.com' } });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Legit User',
                    email: 'legit@example.com',
                    password: 'Stronger!Password#2026',
                    role: 'user'
                });

            if (res.status !== 201) console.log('Allow User Response:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.user.role).toBe('user');
        });
    });
});
