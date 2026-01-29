/**
 * GST API Service
 * Frontend API calls for GST Compliance feature
 */

import api from './api';

const gstApi = {
    // ============== PROFILE ==============
    getProfile: async () => {
        const response = await api.get('/gst/profile');
        return response.data;
    },

    createProfile: async (profileData) => {
        const response = await api.post('/gst/profile', profileData);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/gst/profile', profileData);
        return response.data;
    },

    // ============== INVOICES ==============
    getInvoices: async (params = {}) => {
        const response = await api.get('/gst/invoices', { params });
        return response.data;
    },

    createInvoice: async (invoiceData) => {
        const response = await api.post('/gst/invoices', invoiceData);
        return response.data;
    },

    extractInvoice: async (documentId) => {
        const response = await api.post('/gst/invoices/extract', { documentId });
        return response.data;
    },

    updateInvoice: async (id, invoiceData) => {
        const response = await api.put(`/gst/invoices/${id}`, invoiceData);
        return response.data;
    },

    deleteInvoice: async (id) => {
        const response = await api.delete(`/gst/invoices/${id}`);
        return response.data;
    },

    verifyInvoice: async (id) => {
        const response = await api.post(`/gst/invoices/${id}/verify`);
        return response.data;
    },

    finalizeInvoice: async (id) => {
        const response = await api.post(`/gst/invoices/${id}/finalize`);
        return response.data;
    },

    // ============== FILINGS ==============
    getFilings: async (params = {}) => {
        const response = await api.get('/gst/filings', { params });
        return response.data;
    },

    getPendingFilings: async () => {
        const response = await api.get('/gst/filings/pending');
        return response.data;
    },

    generateGSTR1: async (period) => {
        const response = await api.post('/gst/filings/generate/gstr1', { period });
        return response.data;
    },

    generateGSTR3B: async (period) => {
        const response = await api.post('/gst/filings/generate/gstr3b', { period });
        return response.data;
    },

    submitForReview: async (id) => {
        const response = await api.post(`/gst/filings/${id}/submit-for-review`);
        return response.data;
    },

    caApproveFiling: async (id, approved, comments) => {
        const response = await api.post(`/gst/filings/${id}/ca-approve`, { approved, comments });
        return response.data;
    },

    exportFilingJSON: async (id) => {
        const response = await api.get(`/gst/filings/${id}/export/json`, { responseType: 'blob' });
        return response.data;
    },

    exportFilingExcel: async (id) => {
        const response = await api.get(`/gst/filings/${id}/export/excel`, { responseType: 'blob' });
        return response.data;
    },

    markAsFiled: async (id, arn, filedDate) => {
        const response = await api.post(`/gst/filings/${id}/mark-filed`, { arn, filedDate });
        return response.data;
    },

    // ============== HSN CODES ==============
    searchHSN: async (query, type = null) => {
        const params = { q: query };
        if (type) params.type = type;
        const response = await api.get('/gst/hsn/search', { params });
        return response.data;
    },

    // ============== DEADLINES & PENALTIES ==============
    getDeadlines: async () => {
        const response = await api.get('/gst/deadlines');
        return response.data;
    },

    calculatePenalty: async (dueDate, filingDate, taxLiability = {}) => {
        const response = await api.get('/gst/penalties/calculate', {
            params: { dueDate, filingDate, taxLiability: JSON.stringify(taxLiability) }
        });
        return response.data;
    },

    // ============== ITC RECONCILIATION ==============
    uploadGSTR2A: async (file, period) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('period', period);
        const response = await api.post('/gst/itc/upload-gstr2a', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    uploadGSTR2B: async (file, period) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('period', period);
        const response = await api.post('/gst/itc/upload-gstr2b', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getITCReconciliation: async (period) => {
        const response = await api.get('/gst/itc/reconciliation', { params: { period } });
        return response.data;
    },

    // ============== DASHBOARD ==============
    getDashboardStats: async () => {
        const response = await api.get('/gst/dashboard');
        return response.data;
    },

    // ============== UTILITIES ==============
    validateGSTIN: async (gstin) => {
        const response = await api.get('/gst/validate-gstin', { params: { gstin } });
        return response.data;
    }
};

export default gstApi;
