import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useFinancialData = (consultationId) => {
  const { socket, isConnected } = useSocket();
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConnected || !consultationId) return;

    // Join consultation room
    socket.emit('join_consultation', consultationId);

    // Load initial data
    fetchFinancialData();

    // Listen for updates
    socket.on('financial_data_updated', (data) => {
      setFinancialData(prevData => ({
        ...prevData,
        dataPoints: [...(prevData?.dataPoints || []), data]
      }));
    });

    return () => {
      socket.off('financial_data_updated');
    };
  }, [isConnected, consultationId]);

  const fetchFinancialData = async () => {
    try {
      const response = await fetch(`/api/financial-data/${consultationId}`);
      const data = await response.json();
      
      if (data.success) {
        setFinancialData(data.financialData);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFinancialData = async (newData) => {
    try {
      socket.emit('update_financial_data', {
        consultationId,
        ...newData
      });
    } catch (error) {
      console.error('Error updating financial data:', error);
      throw error;
    }
  };

  return {
    financialData,
    isLoading,
    error,
    updateFinancialData
  };
}; 