import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Radio, Button, Card, Steps, message, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { submitCreditCardForm } from '../../redux/slices/creditCardSlice';
import InteractiveCard from './InteractiveCard';
import styled from 'styled-components';
import CreditCardRecommendations from './CreditCardRecommendations';
import creditCards from './creditCardData';
import moment from 'moment';

const { Step } = Steps;
const { Option } = Select;

const FormContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  min-height: 100vh;
  display: flex;
  gap: 40px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(24,144,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(24,144,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(24,144,255,0.03)"/><circle cx="10" cy="60" r="0.5" fill="rgba(24,144,255,0.03)"/><circle cx="90" cy="40" r="0.5" fill="rgba(24,144,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.5;
    pointer-events: none;
  }
`;

const FormSection = styled.div`
  flex: 1;
  z-index: 1;
`;

const CardSection = styled.div`
  width: 350px;
  padding-top: 60px;
  z-index: 1;
`;

const WelcomeText = styled.div`
  text-align: center;
  padding: 0 0 40px;
  
  h1 {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    line-height: 1.6;
  }
`;

const FormCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 40px;
  }
`;

const StepIndicator = styled.div`
  .ant-steps {
    .ant-steps-item {
      .ant-steps-item-icon {
        background: linear-gradient(135deg, #1890ff, #096dd9);
        border: none;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
      }
      
      .ant-steps-item-title {
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
      
      &.ant-steps-item-active {
        .ant-steps-item-icon {
          background: linear-gradient(135deg, #52c41a, #389e0d);
          animation: pulse 2s infinite;
        }
      }
      
      &.ant-steps-item-finish {
        .ant-steps-item-icon {
          background: linear-gradient(135deg, #52c41a, #389e0d);
        }
      }
    }
  }

  @keyframes pulse {
    0% { box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3); }
    50% { box-shadow: 0 4px 25px rgba(82, 196, 26, 0.5); }
    100% { box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3); }
  }
`;

const FormContainerStyled = styled.div`
  .ant-form-item-label > label {
    font-weight: 600;
    color: #333;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .ant-input {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    &::placeholder {
      color: #bfbfbf;
      font-style: italic;
    }
  }

  .ant-input-affix-wrapper {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 12px 16px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    .ant-input {
      border: none;
      box-shadow: none;
      height: auto;
      padding: 0;
    }
  }

  .ant-select {
    .ant-select-selector {
      border-radius: 12px;
      border: 2px solid #e8f2ff;
      padding: 8px 12px;
      font-size: 16px;
      height: 48px;
      transition: all 0.3s ease;
      background: white;

      &:focus, &:hover {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      }
    }
  }

  .ant-picker {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    padding: 8px 12px;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .ant-input-number {
    border-radius: 12px;
    border: 2px solid #e8f2ff;
    font-size: 16px;
    height: 48px;
    transition: all 0.3s ease;
    background: white;

    &:focus, &:hover {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    .ant-input-number-input {
      height: 44px;
      border: none;
      box-shadow: none;
    }
  }
`;

const ButtonContainer = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PrimaryButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  padding: 0 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(24, 144, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: transparent;
  border: 2px solid #d9d9d9;
  color: #666;
  padding: 0 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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
        <FormContainerStyled>
          <Form.Item
            name="name"
            label="👤 Full Name"
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 3, message: 'Name must be at least 3 characters' },
              { pattern: /^[a-zA-Z\s]*$/, message: 'Name can only contain letters and spaces' }
            ]}
          >
            <Input placeholder="Enter your name as on PAN card" />
          </Form.Item>

          <Form.Item
            name="dob"
            label="📅 Birth Date (Optional)"
            rules={[
              { required: false }
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
              placeholder="Select your birth date"
            />
          </Form.Item>

          <Form.Item
            name="profession"
            label="💼 Profession"
            rules={[{ required: true, message: 'Please select your profession' }]}
          >
            <Select placeholder="Select your profession">
              <Option value="salaried">💼 Salaried</Option>
              <Option value="business">🏢 Business</Option>
              <Option value="professional">👨‍💼 Professional</Option>
              <Option value="student">🎓 Student</Option>
              <Option value="retired">🏖️ Retired</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="📱 Mobile Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian mobile number' }
            ]}
          >
            <Input 
              addonBefore="+91" 
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </Form.Item>
        </FormContainerStyled>
      )
    },
    {
      title: 'Preferences',
      content: (
        <FormContainerStyled>
          <Form.Item
            name="cardType"
            label="💳 Preferred Card Type"
            rules={[{ required: true, message: 'Please select at least one card type' }]}
          >
            <Select mode="multiple" placeholder="Select preferred card types">
              <Option value="rewards">🎁 Rewards</Option>
              <Option value="cashback">💰 Cashback</Option>
              <Option value="travel">✈️ Travel</Option>
              <Option value="business">🏢 Business</Option>
              <Option value="lifestyle">🌟 Lifestyle</Option>
              <Option value="premium">👑 Premium</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="spendingCategories"
            label="🛒 Major Spending Categories"
            rules={[{ required: true, message: 'Please select at least one spending category' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select your major spending categories"
            >
              <Option value="groceries">🛒 Groceries</Option>
              <Option value="dining">🍽️ Dining</Option>
              <Option value="travel">✈️ Travel</Option>
              <Option value="shopping">🛍️ Shopping</Option>
              <Option value="entertainment">🎬 Entertainment</Option>
              <Option value="fuel">⛽ Fuel</Option>
              <Option value="bills">💡 Utility Bills</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="monthlySpend"
            label="💵 Expected Monthly Spend"
            rules={[
              { required: true, message: 'Please enter your expected monthly spend' },
              { type: 'number', min: 5000, message: 'Monthly spend should be at least ₹5,000' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              min={5000}
              step={1000}
              placeholder="Enter amount in INR"
            />
          </Form.Item>
        </FormContainerStyled>
      )
    },
    {
      title: 'Additional Details',
      content: (
        <FormContainerStyled>
          <Form.Item
            name="bankPreference"
            label="🏦 Preferred Banks"
            rules={[{ type: 'array' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select your preferred banks (optional)"
            >
              <Option value="hdfc">🏦 HDFC Bank</Option>
              <Option value="icici">🏦 ICICI Bank</Option>
              <Option value="axis">🏦 Axis Bank</Option>
              <Option value="sbi">🏦 State Bank of India</Option>
              <Option value="citi">🏦 Citibank</Option>
              <Option value="amex">🏦 American Express</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="additionalFeatures"
            label="⭐ Important Card Features"
            rules={[{ type: 'array' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select important features (optional)"
            >
              <Option value="lounge">✈️ Airport Lounge Access</Option>
              <Option value="insurance">🛡️ Insurance Coverage</Option>
              <Option value="emi">💳 EMI Options</Option>
              <Option value="forex">💱 Low Forex Markup</Option>
              <Option value="welcome">🎉 Welcome Benefits</Option>
              <Option value="movie">🎬 Movie Ticket Offers</Option>
            </Select>
          </Form.Item>
        </FormContainerStyled>
      )
    }
  ];

  const getRecommendations = (userPreferences) => {
    // Create a scoring system for each card
    const scoredCards = creditCards.map(card => {
      let score = 0;
      
      // Score based on spending categories
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
        
        const mappedCategory = categoryMapping[category];
        if (card.ratings[mappedCategory]) {
          score += card.ratings[mappedCategory] * 2; // Give more weight to preferred spending categories
        }
      });

      // Score based on card type preferences
      userPreferences.cardType?.forEach(type => {
        if (card.special_remarks.toLowerCase().includes(type.toLowerCase())) {
          score += 15; // Give significant weight to matching card types
        }
      });

      // Score based on bank preferences
      if (userPreferences.bankPreference) {
        userPreferences.bankPreference.forEach(bank => {
          if (card.name.toLowerCase().includes(bank.toLowerCase())) {
            score += 10; // Bonus points for preferred banks
          }
        });
      }

      // Adjust score based on monthly spend
      const monthlySpend = parseFloat(userPreferences.monthlySpend || 0);
      if (monthlySpend > 100000) { // High spender
        if (card.annual_charges.includes('10,000') || card.special_remarks.toLowerCase().includes('premium')) {
          score += 10;
        }
      } else if (monthlySpend < 25000) { // Low spender
        if (card.annual_charges.includes('0') || card.annual_charges.includes('500')) {
          score += 10;
        }
      }

      // Additional features score
      if (userPreferences.additionalFeatures) {
        userPreferences.additionalFeatures.forEach(feature => {
          if (card.key_benefits.toLowerCase().includes(feature.toLowerCase())) {
            score += 5;
          }
        });
      }

      return {
        ...card,
        score
      };
    });

    // Sort cards by score and return top 6 recommendations
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  const next = async () => {
    try {
      // Get the fields in the current step
      const currentStepContent = steps[currentStep].content.props.children;
      const currentFields = currentStepContent
        .filter(item => item.props.name !== 'dob') // Exclude dob from validation
        .map(item => item.props.name);
      
      // Validate current step fields
      await form.validateFields(currentFields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
      // Show specific validation errors
      if (error.errorFields) {
        error.errorFields.forEach(field => {
          message.error(field.errors[0]);
        });
      } else {
        message.error('Please fill in all required fields correctly');
      }
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values) => {
    try {
      // Format the values
      const formValues = {
        ...values,
        monthlySpend: values.monthlySpend ? parseFloat(values.monthlySpend) : 0,
        dob: null, // Set to null since we're making it optional
        cardType: values.cardType || [],
        spendingCategories: values.spendingCategories || [],
        bankPreference: values.bankPreference || [],
        additionalFeatures: values.additionalFeatures || []
      };

      console.log('Form Values:', formValues); // Debug log

      // Get recommendations
      const recommendations = getRecommendations(formValues);
      console.log('Recommendations:', recommendations); // Debug log
      
      if (recommendations.length === 0) {
        message.warning('No matching credit cards found. Please adjust your preferences.');
        return;
      }

      // Set recommendations first
      setRecommendations(recommendations);

      // Then try to submit the form
      try {
        await dispatch(submitCreditCardForm(formValues)).unwrap();
        message.success('Form submitted successfully! Here are your recommended cards.');
      } catch (submitError) {
        console.error('Form submission error:', submitError);
        // Even if submission fails, still show recommendations
        message.warning('Could not save your preferences, but here are your recommended cards.');
      }
    } catch (error) {
      console.error('Form processing error:', error);
      message.error('There was an error processing your form. Please try again.');
    }
  };

  const handleFormChange = (changedValues, allValues) => {
    setFormData(allValues);
    
    // Only clear recommendations if relevant fields changed
    const relevantFields = ['cardType', 'spendingCategories', 'monthlySpend', 'bankPreference', 'additionalFeatures'];
    const hasRelevantChanges = Object.keys(changedValues).some(key => relevantFields.includes(key));
    
    if (hasRelevantChanges && recommendations.length > 0) {
      setRecommendations([]);
    }
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

export default CreditCardForm;