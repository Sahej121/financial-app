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
            label="Birth Date (Optional)"
            rules={[
              { required: false }
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
            />
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
              <Option value="retired">Retired</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Mobile Number"
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
            rules={[{ required: true, message: 'Please select at least one card type' }]}
          >
            <Select mode="multiple" placeholder="Select preferred card types">
              <Option value="rewards">Rewards</Option>
              <Option value="cashback">Cashback</Option>
              <Option value="travel">Travel</Option>
              <Option value="business">Business</Option>
              <Option value="lifestyle">Lifestyle</Option>
              <Option value="premium">Premium</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="spendingCategories"
            label="Major Spending Categories"
            rules={[{ required: true, message: 'Please select at least one spending category' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select your major spending categories"
            >
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
            rules={[{ type: 'array' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select your preferred banks (optional)"
            >
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
            rules={[{ type: 'array' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select important features (optional)"
            >
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