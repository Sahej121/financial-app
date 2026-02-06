const scoringService = require('../src/services/scoringService');

describe('Scoring Service Verification', () => {

    describe('calculateDataCompleteness', () => {
        test('should return 100 for fully filled investment profile', () => {
            const submission = {
                planningPurpose: 'investment',
                monthlyIncome: '100000',
                monthlySavings: '20000',
                incomeStability: 'stable',
                riskPreference: 'balanced',
                investmentExperience: 'intermediate',
                hasHealthInsurance: true,
                hasLifeInsurance: true,
                achievementTimeline: '5 years',
                successPriority: 'wealth_creation'
            };
            const score = scoringService.calculateDataCompleteness(submission);
            expect(score).toBe(100);
        });

        test('should return low score for empty profile', () => {
            const submission = {
                planningPurpose: 'investment'
            };
            const score = scoringService.calculateDataCompleteness(submission);
            expect(score).toBeLessThan(20);
        });

        test('should handle business_expansion purpose', () => {
            const submission = {
                planningPurpose: 'business_expansion',
                expansionType: 'new_branch',
                fundingRequired: '500000',
                expansionTimeline: '6 months',
                businessType: 'retail',
                industryType: 'fashion',
                annualRevenue: '1000000',
                employeeCount: '5',
                profitMargin: '10%',
                cashReserves: '50000'
            };
            const score = scoringService.calculateDataCompleteness(submission);
            expect(score).toBe(100);
        });
    });

    describe('getMissingFields', () => {
        test('should identify missing fields correctly', () => {
            const submission = {
                planningPurpose: 'investment',
                monthlyIncome: '100000',
                // Missing monthlySavings
                // Missing riskPreference
                investmentExperience: 'intermediate',
                hasHealthInsurance: true,
                hasLifeInsurance: true
            };

            const missing = scoringService.getMissingFields(submission);
            expect(missing).toContain('Monthly Savings');
            expect(missing).toContain('Risk Preference');
            expect(missing).not.toContain('Monthly Income');
        });
    });
});
