/**
 * Decision Pack Controller - API endpoints for Decision Intelligence
 */

const decisionPackService = require('../services/decisionPackService');
const scoringService = require('../services/scoringService');
const truthValidationService = require('../services/truthValidationService');
const { FinancialPlanningSubmission } = require('../models');

/**
 * Generate a new Decision Pack for a submission
 * POST /api/decision-packs/:submissionId/generate
 */
exports.generatePack = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        // Verify user owns this submission or is an analyst
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        if (submission.userId !== userId && !['ca', 'financial_planner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Not authorized to access this submission' });
        }

        const pack = await decisionPackService.generatePack(submissionId);

        res.json({
            success: true,
            message: 'Decision Pack generated successfully',
            data: pack
        });
    } catch (error) {
        console.error('Error generating Decision Pack:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get existing Decision Pack
 * GET /api/decision-packs/:submissionId
 */
exports.getPack = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        if (submission.userId !== userId && !['ca', 'financial_planner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const pack = await decisionPackService.getPack(submissionId);

        res.json({
            success: true,
            data: pack
        });
    } catch (error) {
        console.error('Error getting Decision Pack:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get scores only (lighter endpoint)
 * GET /api/decision-packs/:submissionId/scores
 */
exports.getScores = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        if (submission.userId !== userId && !['ca', 'financial_planner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const scores = await scoringService.generateAllScores(submissionId);

        res.json({
            success: true,
            data: scores
        });
    } catch (error) {
        console.error('Error getting scores:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Validate submission data
 * GET /api/decision-packs/:submissionId/validate
 */
exports.validateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        if (submission.userId !== userId && !['ca', 'financial_planner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const validation = await truthValidationService.validate(submissionId);

        res.json({
            success: true,
            data: validation
        });
    } catch (error) {
        console.error('Error validating submission:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Submit analyst feedback on a Decision Pack
 * POST /api/decision-packs/:submissionId/feedback
 */
exports.submitFeedback = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { signalsConfirmed, signalsRejected, notes, outcome } = req.body;

        if (!['ca', 'financial_planner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Only analysts can submit feedback' });
        }

        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const feedback = {
            analystId: req.user.id,
            analystName: req.user.name,
            submittedAt: new Date().toISOString(),
            signalsConfirmed: signalsConfirmed || [],
            signalsRejected: signalsRejected || [],
            notes,
            outcome
        };

        await submission.update({
            analystFeedback: feedback,
            outcomeTracking: { outcome, recordedAt: new Date().toISOString() }
        });

        res.json({
            success: true,
            message: 'Feedback recorded successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
