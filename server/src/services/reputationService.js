const { CA, FinancialPlanner, Meeting, OutcomeRecord, Feedback, sequelize } = require('../models');
const { Op } = require('sequelize');

class ReputationService {
    /**
     * Calculate and update Trust Score for a professional
     * @param {number} userId - The user ID of the professional
     * @param {string} role - 'ca' or 'financial_planner'
     */
    async updateTrustScore(userId, role) {
        try {
            console.log(`Updating Trust Score for ${role} ${userId}`);

            // 1. Get current metrics
            const metrics = await this.calculateMetrics(userId);

            // 2. Calculate component scores (0-100)
            const competenceScore = this.calculateCompetence(metrics);
            const responsivenessScore = this.calculateResponsiveness(metrics);
            const outcomeScore = this.calculateOutcomeQuality(metrics);
            const consistencyScore = this.calculateConsistency(metrics);

            // 3. Weighted Trust Score
            // Weights: Competence (40%), Responsiveness (25%), Outcomes (25%), Consistency (10%)
            const trustScore = (
                (competenceScore * 0.4) +
                (responsivenessScore * 0.25) +
                (outcomeScore * 0.25) +
                (consistencyScore * 0.1)
            );

            // 4. Update the professional record
            const updateData = {
                trustScore: parseFloat(trustScore.toFixed(2)),
                competenceScore: parseFloat(competenceScore.toFixed(2)),
                responsivenessScore: parseFloat(responsivenessScore.toFixed(2)),
                outcomeScore: parseFloat(outcomeScore.toFixed(2)),
                consistencyScore: parseFloat(consistencyScore.toFixed(2)),
                totalCompletedCases: metrics.totalCompleted,
                verifiedSpecializations: metrics.specializations
            };

            if (role === 'ca') {
                await CA.update(updateData, { where: { userId } });
            } else if (role === 'financial_planner' || role === 'analyst') {
                await FinancialPlanner.update(updateData, { where: { userId } });
            }

            return updateData;
        } catch (error) {
            console.error('Error in ReputationService.updateTrustScore:', error);
            throw error;
        }
    }

    async calculateMetrics(userId) {
        // A. Case Volume
        const completedMeetings = await Meeting.count({
            where: {
                professionalId: userId,
                status: 'completed'
            }
        });

        // B. Outcomes
        const outcomes = await OutcomeRecord.findAll({
            where: { analystId: userId },
            attributes: ['outcomeScore', 'adviceType', 'financialImpact']
        });

        const avgOutcomeScore = outcomes.length > 0
            ? outcomes.reduce((sum, r) => sum + (r.outcomeScore || 0), 0) / outcomes.length
            : 0;

        // C. Specialization Depth
        const specializationCounts = {};
        outcomes.forEach(r => {
            const type = r.adviceType || 'general';
            specializationCounts[type] = (specializationCounts[type] || 0) + 1;
        });

        // Normalize specialization depth (simple heuristic: >20 cases = 1.0)
        const specializations = {};
        Object.keys(specializationCounts).forEach(type => {
            specializations[type] = Math.min(specializationCounts[type] / 20, 1.0).toFixed(2);
        });

        // D. Responsiveness (Mock data for now, real implementation would track transition timestamps)
        // In a real system, we'd query ActivityLog for time between 'assigned' and 'completed'
        const responsivenessMetric = 0.85; // Placeholder

        return {
            totalCompleted: completedMeetings,
            outcomeCount: outcomes.length,
            avgOutcomeScore,
            responsivenessMetric,
            specializations
        };
    }

    calculateCompetence(metrics) {
        // Base score on volume + specialization depth
        const volumeScore = Math.min(metrics.totalCompleted / 50, 1) * 100; // Cap at 50 cases
        return (volumeScore * 0.7) + (metrics.avgOutcomeScore * 10 * 0.3);
    }

    calculateResponsiveness(metrics) {
        return metrics.responsivenessMetric * 100;
    }

    calculateOutcomeQuality(metrics) {
        // Direct mapping of 1-10 outcome score to 0-100
        // If no outcomes, default to 50
        if (metrics.outcomeCount === 0) return 50;
        return metrics.avgOutcomeScore * 10;
    }

    calculateConsistency(metrics) {
        // Simple placeholder: higher volume usually implies consistency in this simplified model
        if (metrics.totalCompleted < 10) return 50;
        return 80;
    }
}

module.exports = new ReputationService();
