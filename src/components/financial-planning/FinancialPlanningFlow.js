import React, { useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Card, Steps, message } from 'antd';
import styled from 'styled-components';

const { Step } = Steps;
const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
`;

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
`;

const FinancialPlanningFlow = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Basic Information',
      content: (
        <>
          <Form.Item
            name="planningType"
            label="What type of financial planning do you need?"
            rules={[{ required: true, message: 'Please select planning type' }]}
          >
            <Select>
              <Option value="business">Business Expansion</Option>
              <Option value="loan">Loan Protection</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="currentSituation"
            label="Current Financial Situation"
            rules={[{ required: true, message: 'Please describe your situation' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      )
    },
    {
      title: 'Financial Details',
      content: (
        <>
          <Form.Item
            name="monthlyIncome"
            label="Monthly Income"
            rules={[{ required: true, message: 'Please enter your monthly income' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="monthlyExpenses"
            label="Monthly Expenses"
            rules={[{ required: true, message: 'Please enter your monthly expenses' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </>
      )
    },
    {
      title: 'Goals',
      content: (
        <>
          <Form.Item
            name="financialGoal"
            label="Financial Goal"
            rules={[{ required: true, message: 'Please enter your financial goal' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="timeframe"
            label="Timeframe"
            rules={[{ required: true, message: 'Please select your timeframe' }]}
          >
            <Select>
              <Option value="short">Short Term (1-2 years)</Option>
              <Option value="medium">Medium Term (2-5 years)</Option>
              <Option value="long">Long Term (5+ years)</Option>
            </Select>
          </Form.Item>
        </>
      )
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = (values) => {
    console.log('Form values:', values);
    message.success('Financial planning information submitted successfully!');
  };

  return (
    <FormContainer>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <StyledCard>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {steps[currentStep].content}

          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prev}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={() => form.submit()}>
                Submit
              </Button>
            )}
          </div>
        </Form>
      </StyledCard>
    </FormContainer>
  );
};

export default FinancialPlanningFlow; 