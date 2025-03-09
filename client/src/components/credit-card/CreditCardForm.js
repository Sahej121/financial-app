import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Radio, Button, Card, Steps, message, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { submitCreditCardForm } from '../../redux/slices/creditCardSlice';
import InteractiveCard from './InteractiveCard';
import styled from 'styled-components';
import CreditCardRecommendations from './CreditCardRecommendations';
import creditCards from './creditCardData';

const { Step } = Steps;
const { Option } = Select;

const FormContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 16px;
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  gap: 40px;
`;

const FormSection = styled.div`
  flex: 1;
`;

const CardSection = styled.div`
  width: 350px;
  padding-top: 60px;
`;

const WelcomeText = styled.div`
  text-align: center;
  padding: 0 0 40px;
  h1 {
    color: #1a1f71;
    margin-bottom: 16px;
  }
  p {
    color: #666;
    font-size: 16px;
  }
`;

const CreditCardForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.creditCard);

  const steps = [
    {
      title: 'Basic Details',
      content: (
        <>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your name as on PAN card" />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Birth Date"
            rules={[{ required: true, message: 'Please select your birth date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            name="profession"
            label="Profession"
            rules={[{ required: true, message: 'Please select your profession' }]}
          >
            <Select placeholder="Select your profession">
              <Option value="salaried">Salaried</Option>
              <Option value="business">Business</Option>
              <Option value="professional">Professional</Option>
              <Option value="student">Student</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Mobile Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input addonBefore="+91" placeholder="10-digit mobile number" />
          </Form.Item>
        </>
      )
    },
    {
      title: 'Preferences',
      content: (
        <>
          <Form.Item
            name="cardType"
            label="Preferred Card Type"
            rules={[{ required: true, message: 'Please select preferred card type' }]}
          >
            <Select mode="multiple">
              <Option value="rewards">Rewards</Option>
              <Option value="cashback">Cashback</Option>
              <Option value="travel">Travel</Option>
              <Option value="business">Business</Option>
              <Option value="lifestyle">Lifestyle</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="spendingCategories"
            label="Major Spending Categories"
            rules={[{ required: true, message: 'Please select spending categories' }]}
          >
            <Select mode="multiple">
              <Option value="groceries">Groceries</Option>
              <Option value="dining">Dining</Option>
              <Option value="travel">Travel</Option>
              <Option value="shopping">Shopping</Option>
              <Option value="entertainment">Entertainment</Option>
              <Option value="fuel">Fuel</Option>
              <Option value="bills">Utility Bills</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="monthlySpend"
            label="Expected Monthly Spend"
            rules={[{ required: true, message: 'Please enter expected monthly spend' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              min={0}
              step={1000}
            />
          </Form.Item>
        </>
      )
    },
    {
      title: 'Additional Details',
      content: (
        <>
          <Form.Item
            name="bankPreference"
            label="Preferred Banks"
          >
            <Select mode="multiple">
              <Option value="hdfc">HDFC Bank</Option>
              <Option value="icici">ICICI Bank</Option>
              <Option value="axis">Axis Bank</Option>
              <Option value="sbi">State Bank of India</Option>
              <Option value="citi">Citibank</Option>
              <Option value="amex">American Express</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="additionalFeatures"
            label="Important Card Features"
          >
            <Select mode="multiple">
              <Option value="lounge">Airport Lounge Access</Option>
              <Option value="insurance">Insurance Coverage</Option>
              <Option value="emi">EMI Options</Option>
              <Option value="forex">Low Forex Markup</Option>
              <Option value="welcome">Welcome Benefits</Option>
              <Option value="movie">Movie Ticket Offers</Option>
            </Select>
          </Form.Item>
        </>
      )
    }
  ];

  const getRecommendations = (userPreferences) => {
    return creditCards.filter(card => {
      const matchesCardType = userPreferences.cardType?.some(type =>
        card.special_remarks.toLowerCase().includes(type.toLowerCase()));

      const matchesSpendingCategory = userPreferences.spendingCategories?.some(category => {
        const categoryMapping = {
          groceries: 'shopping',
          dining: 'dining_entertainment',
          travel: 'travel',
          shopping: 'shopping',
          entertainment: 'dining_entertainment',
          fuel: 'fuel',
          bills: 'charges'
        };
        return card.ratings[categoryMapping[category]] >= 7;
      });

      return matchesCardType || matchesSpendingCategory;
    });
  };

  const next = async () => {
    try {
      await form.validateFields(steps[currentStep].fields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation error is handled by the form
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values) => {
    try {
      await dispatch(submitCreditCardForm({
        ...values,
        annualIncome: parseFloat(values.annualIncome),
      })).unwrap();
      const recommendations = getRecommendations(values);
      setRecommendations(recommendations);
      message.success('Form submitted successfully!');
    } catch (error) {
      message.error('Failed to submit form. Please try again.');
    }
  };

  const handleFormChange = (_, allValues) => {
    setFormData(allValues);
  };

  return (
    <FormContainer>
      <CardSection>
        <InteractiveCard formData={formData} />
      </CardSection>
      <FormSection>
        <WelcomeText>
          <h1>Welcome to Credit Card Recommendation</h1>
          <p>Please fill in your basic information:</p>
        </WelcomeText>
        
        <Card>
          <Steps current={currentStep} style={{ marginBottom: 40 }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={handleFormChange}
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
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              )}
            </div>
          </Form>
        </Card>

        {recommendations.length > 0 && (
          <CreditCardRecommendations recommendations={recommendations} />
        )}
      </FormSection>
    </FormContainer>
  );
};
// In CreditCardForm.js

const getBestCreditCard = (userPreferences) => {
  let bestCard = null;
  let highestScore = 0;

  creditCards.forEach(card => {
    let score = 0;

    // Example scoring logic based on user preferences
    if (userPreferences.cardType?.some(type => card.special_remarks.toLowerCase().includes(type.toLowerCase()))) {
      score += 10;
    }

    userPreferences.spendingCategories?.forEach(category => {
      const categoryMapping = {
        groceries: 'shopping',
        dining: 'dining_entertainment',
        travel: 'travel',
        shopping: 'shopping',
        entertainment: 'dining_entertainment',
        fuel: 'fuel',
        bills: 'charges'
      };
      if (card.ratings[categoryMapping[category]] >= 7) {
        score += card.ratings[categoryMapping[category]];
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestCard = card;
    }
  });

  return bestCard;
};

const onFinish = async (values) => {
  try {
    await dispatch(submitCreditCardForm({
      ...values,
      annualIncome: parseFloat(values.annualIncome),
    })).unwrap();

    const bestCard = getBestCreditCard(values);
    setRecommendations([bestCard]); // Set the best card as the recommendation

    message.success('Form submitted successfully!');
  } catch (error) {
    message.error('Failed to submit form. Please try again.');
  }
};

export default CreditCardForm;