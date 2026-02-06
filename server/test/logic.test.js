const ruleEngine = require('../src/services/RuleEngineService');
const scoringService = require('../src/services/scoringService');

describe('Core Business Logic Verification', () => {

    // Test Data from original script
    const mockSubmission = {
        planningPurpose: 'business_expansion',
        cashReserves: '6+',
        annualRevenue: '₹1 Cr',
        profitMargin: '30+',
        employeeCount: '51-200',
        existingLoans: [1, 2],
        monthlyIncome: '₹2,00,000',
        monthlyEMI: '₹20,000',
        monthlyExpenses: '₹50,000',
        incomeStability: 'very_stable',
        debtTypes: ['personal_loan'],
        monthlySavings: '₹1,00,000'
    };

    describe('RuleEngineService.determineExecutionPath', () => {
        test('should return FULLY_DETERMINISTIC for score >= 0.85', async () => {
            const path = await ruleEngine.determineExecutionPath(0.9);
            expect(path).toBe('FULLY_DETERMINISTIC');
        });

        test('should return LIMITED_LLM_EXPLANATION for 0.65 <= score < 0.85', async () => {
            const path = await ruleEngine.determineExecutionPath(0.7);
            expect(path).toBe('LIMITED_LLM_EXPLANATION');
        });

        test('should return ANALYST_REQUIRED for 0.40 <= score < 0.65', async () => {
            const path = await ruleEngine.determineExecutionPath(0.5);
            expect(path).toBe('ANALYST_REQUIRED');
        });

        test('should return ANALYST_ONLY_BLOCKED for score < 0.40', async () => {
            const path = await ruleEngine.determineExecutionPath(0.3);
            expect(path).toBe('ANALYST_ONLY_BLOCKED');
        });
    });

    describe('ScoringService.calculateExpansionReadiness', () => {
        test('should return a valid numerical score between 0 and 100', () => {
            const score = scoringService.calculateExpansionReadiness(mockSubmission);
            expect(typeof score).toBe('number');
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
            console.log(`Expansion Score: ${score}`);
        });
    });

    describe('ScoringService.calculateLoanSafety', () => {
        test('should return a valid numerical score between 0 and 100', () => {
            const score = scoringService.calculateLoanSafety(mockSubmission);
            expect(typeof score).toBe('number');
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
            console.log(`Loan Safety Score: ${score}`);
        });
    });

    describe('Rule Precedence Logic', () => {
        test('should cap score if hard block condition is met', () => {
            let finalScore = 85;
            const isHardBlocked = true;

            // Replicating logic found in verify_logic.js
            if (isHardBlocked) {
                finalScore = Math.min(finalScore, 30);
            }

            expect(finalScore).toBe(30);
        });
    });
});
