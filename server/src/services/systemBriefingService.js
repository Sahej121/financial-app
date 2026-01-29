/**
 * System Briefing Service
 * Generates financial briefings using deterministic logic.
 */

exports.generateSystemBriefing = (submission, insights) => {
    // 1. Calculate Key Metrics
    const totalAssets = Object.values(submission.assets || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalLiabilities = Object.values(submission.liabilities || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const monthlyIncome = parseFloat(submission.monthlyIncome || 0);
    const monthlyExpenses = parseFloat(submission.monthlyExpenses || 0);
    const monthlySurplus = monthlyIncome - monthlyExpenses;

    const debtToIncome = monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) + '%' : '0%';

    // 2. Identify Critical Risks
    const criticalRisks = [];
    if (submission.riskScore > 70) criticalRisks.push("High risk profile detected - review asset allocation.");
    if (totalLiabilities > totalAssets * 0.5) criticalRisks.push("High leverage detected - debt-to-asset ratio exceeds 50%.");
    if (monthlyExpenses > monthlyIncome * 0.8) criticalRisks.push("Tight cash flow - expenses exceed 80% of income.");

    // Add risks from document insights
    insights.forEach(insight => {
        if (insight.redFlags && Array.isArray(insight.redFlags)) {
            criticalRisks.push(...insight.redFlags);
        }
    });

    if (criticalRisks.length === 0) {
        criticalRisks.push("No immediate red flags detected based on provided data.");
    }

    // 3. Strategy Outline
    let strategyOutline = `Focus on ${submission.successPriority || 'overall growth'}. `;
    if (totalLiabilities > 0) strategyOutline += "Prioritize debt consolidation and interest rate optimization. ";
    if (netWorth > 1000000) strategyOutline += "Recommend diversification into high-yield equity and alternative assets. ";
    else strategyOutline += "Focus on building a robust emergency fund and consistent SIP contributions. ";

    // 4. Action Plan
    const actionPlan = [
        "Verify asset ownership documents",
        "Review debt repayment schedule",
        "Benchmark portfolio against market indices"
    ];

    if (insights.length === 0) {
        actionPlan.push("Request pending document uploads for full verification");
    }

    return {
        keyMetrics: {
            netWorth: netWorth.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            debtToIncome: debtToIncome,
            monthlySurplus: monthlySurplus.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        },
        criticalRisks: Array.from(new Set(criticalRisks)).slice(0, 5), // Unique top 5
        strategyOutline,
        actionPlan,
        isSystemGenerated: true
    };
};
