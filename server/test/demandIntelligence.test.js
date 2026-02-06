
describe('DemandIntelligenceService', () => {
    let demandIntelligenceService;
    let FinancialPlanningSubmission;
    let DocumentInsight;
    let aiProvider;

    beforeEach(() => {
        jest.resetModules();

        // Mock Models
        jest.mock('../src/models', () => ({
            FinancialPlanningSubmission: { findByPk: jest.fn() },
            DocumentInsight: { findAll: jest.fn() }
        }));

        // Mock AI Provider
        jest.mock('../src/utils/aiProvider', () => ({
            generateJSON: jest.fn()
        }));

        // Re-require
        demandIntelligenceService = require('../src/services/demandIntelligenceService');
        const models = require('../src/models');
        aiProvider = require('../src/utils/aiProvider');
        FinancialPlanningSubmission = models.FinancialPlanningSubmission;
        DocumentInsight = models.DocumentInsight;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeDemandIntent', () => {
        test('should use AI Provider result when available', async () => {
            const mockSubmission = { id: 1, planningPurpose: 'tax_planning', monthlyIncome: 100 };
            FinancialPlanningSubmission.findByPk.mockResolvedValue(mockSubmission);
            DocumentInsight.findAll.mockResolvedValue([]);

            const mockAIResponse = {
                nuances: ['TAX_OPTIMIZATION', 'HIGH_GROWTH'],
                urgency: 'HIGH',
                complexityLevel: 'MODERATE',
                suggestedExpertise: ['TAX_SPECIALIST'],
                summary: 'Client needs tax help.'
            };
            aiProvider.generateJSON.mockResolvedValue(mockAIResponse);

            const result = await demandIntelligenceService.analyzeDemandIntent(1);

            expect(aiProvider.generateJSON).toHaveBeenCalled();
            expect(result).toEqual(mockAIResponse);
        });

        test('should use heuristic fallback when AI fails', async () => {
            const mockSubmission = {
                id: 2,
                planningPurpose: 'loan_settlement',
                settlementGoal: 'Avoid default',
                otherNotes: 'Banks are harassing me.',
                totalDebtAmount: 6000000
            };
            FinancialPlanningSubmission.findByPk.mockResolvedValue(mockSubmission);
            DocumentInsight.findAll.mockResolvedValue([{}, {}, {}, {}]);

            // Simulate AI failure
            aiProvider.generateJSON.mockRejectedValue(new Error('AI invalid'));

            const result = await demandIntelligenceService.analyzeDemandIntent(2);

            expect(result.nuances).toContain('DEBT_DISTRESS');
            expect(result.complexityLevel).toBe('COMPLEX');
            expect(result.summary).toContain('Heuristic analysis applied');
        });
    });
});
