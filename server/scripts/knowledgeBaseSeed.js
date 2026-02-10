const vectorStoreService = require('../src/services/vectorStoreService');
const logger = require('../src/utils/logger');
require('dotenv').config();

// Standard Financial Knowledge for India
const knowledgeBase = [
    {
        title: "Section 80C Deductions",
        content: `Section 80C of the Income Tax Act allows for deductions up to ₹1.5 lakh from the gross total income. 
        Eligible investments include:
        - Life Insurance Premium
        - Public Provident Fund (PPF)
        - Employee Provident Fund (EPF)
        - Equity Linked Savings Scheme (ELSS)
        - National Savings Certificate (NSC)
        - Unit Linked Insurance Plan (ULIP)
        - Sukanya Samriddhi Yojana (SSY)
        - Senior Citizens Savings Scheme (SCSS)
        - Principal repayment on housing loan
        - Tuition fees for children.
        These deductions help reduce the taxable income of an individual or HUF.`
    },
    {
        title: "Section 80D (Health Insurance Premium)",
        content: `Section 80D provides deduction for health insurance premiums paid for self, spouse, children, and parents.
        - Self, Spouse, Children: Max ₹25,000 (₹50,000 if senior citizen)
        - Parents: Additional ₹25,000 (₹50,000 if senior citizen)
        - Preventive Health Checkup: Included within the limit up to ₹5,000.
        Total deduction can be up to ₹1,00,000 if both the individual and parents are above 60 years.`
    },
    {
        title: "House Rent Allowance (HRA) Exemption",
        content: `HRA exemption is calculated as the minimum of:
        1. Actual HRA received from employer.
        2. 50% of (Basic salary + DA) for those living in metro cities (40% for non-metros).
        3. Actual rent paid minus 10% of (Basic salary + DA).
        To claim HRA exemption, rent receipts or rent agreement is required. If rent exceeds ₹1 lakh per annum, landlord's PAN is mandatory.`
    },
    {
        title: "Standard Deduction",
        content: `A standard deduction of ₹50,000 (FY 2024-25) is available for salaried individuals and pensioners, irrespective of actual expenses. This is deducted from gross salary before calculating taxable income.`
    },
    {
        title: "Tax Regime Comparison: New vs Old",
        content: `Old Regime: Offer multiple deductions like 80C, 80D, HRA, LTA, interest on home loan. Best for those with high investments.
        New Regime (Default): Lower tax rates but most deductions/exemptions (including 80C, 80D, HRA) are not allowed.
        Standard deduction is now allowed in the New Regime as well. Choosing the right regime depends on the individual's total investments and salary structure.`
    }
];

async function seedKnowledge() {
    console.log('--- Financial Knowledge Base Seeder ---');
    try {
        for (const item of knowledgeBase) {
            console.log(`Ingesting: ${item.title}...`);
            await vectorStoreService.ingestDocument(item.content, {
                title: item.title,
                source: 'Official Financial Guidelines',
                category: 'knowledge_base',
                documentId: null, // Global knowledge
                submissionId: null // Global knowledge
            });
        }
        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedKnowledge();
