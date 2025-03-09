import React, { useState } from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const APITest = () => {
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    try {
      const response = await axios.get('http://localhost:5000/test');
      message.success(`API Test Successful: ${response.data.message}`);
      console.log('API Test Response:', response.data);
    } catch (error) {
      message.error(`API Test Failed: ${error.message}`);
      console.error('API Test Error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button onClick={testAPI} loading={testing}>
      Test API Connection
    </Button>
  );
};

export default APITest; 