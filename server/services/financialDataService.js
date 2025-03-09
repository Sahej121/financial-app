const { getIO } = require('../config/socketConfig');

class FinancialDataService {
  static async updateFinancialData(consultationId, data) {
    try {
      // Save to database
      await FinancialData.findOneAndUpdate(
        { consultationId },
        { 
          $push: { 
            dataPoints: {
              timestamp: new Date(),
              ...data
            }
          }
        },
        { upsert: true }
      );

      // Emit to connected clients
      getIO().to(`consultation_${consultationId}`).emit('financial_data_updated', data);

      return true;
    } catch (error) {
      console.error('Error updating financial data:', error);
      throw error;
    }
  }

  static async getFinancialData(consultationId) {
    try {
      const data = await FinancialData.findOne({ consultationId });
      return data;
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  }
}

module.exports = FinancialDataService; 