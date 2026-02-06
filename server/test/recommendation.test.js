
describe('Recommendation Service', () => {
    let recommendationService;
    let CA;
    let FinancialPlanner;

    beforeEach(() => {
        jest.resetModules();

        jest.mock('../src/models', () => ({
            CA: {
                findAll: jest.fn()
            },
            FinancialPlanner: {
                findAll: jest.fn()
            },
            FinancialPlanningSubmission: {
                findByPk: jest.fn()
            }
        }));

        recommendationService = require('../src/services/recommendationService');
        const models = require('../src/models');
        CA = models.CA;
        FinancialPlanner = models.FinancialPlanner;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('recommendCAs', () => {
        test('should recommend Tax Specialists for tax_planning purpose', async () => {
            const mockCAs = [
                { id: 1, name: 'CA One', specializations: ['GST', 'Tax'], rating: 4.8 },
                { id: 2, name: 'CA Two', specializations: ['Audit'], rating: 4.5 }
            ];
            CA.findAll.mockResolvedValue(mockCAs);

            const userProfile = { planningPurpose: 'tax_planning' };
            const recommended = await recommendationService.recommendCAs(userProfile);

            expect(recommended.length).toBe(2);
            expect(recommended[0].id).toBe(1); // Tax specialist first
            expect(recommended[0].matchScore).toBeGreaterThan(recommended[1].matchScore);
        });
    });

    describe('recommendPlanners', () => {
        test('should recommend Wealth Managers for high income investment profiles', async () => {
            const mockPlanners = [
                { id: 1, name: 'Planner High', specializations: ['Wealth Management'], minIncome: 100000, rating: 4.9 },
                { id: 2, name: 'Planner Basic', specializations: ['Mutual Funds'], minIncome: 0, rating: 4.5 }
            ];
            FinancialPlanner.findAll.mockResolvedValue(mockPlanners);

            const userProfile = { planningPurpose: 'investment', monthlyIncome: 200000 };
            const recommended = await recommendationService.recommendPlanners(userProfile);

            expect(recommended[0].id).toBe(1);
        });
    });
});
