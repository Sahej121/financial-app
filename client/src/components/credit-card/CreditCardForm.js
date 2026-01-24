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
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 40px;
  position: relative;
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const FormSection = styled.div`
  flex: 1;
  z-index: 1;
`;

const CardSection = styled.div`
  width: 350px;
  padding-top: 20px;
  z-index: 1;
  
  @media (max-width: 900px) {
    width: 100%;
    order: -1;
  }
`;

const WelcomeText = styled.div`
  text-align: left;
  padding-bottom: 32px;
  
  h2 {
    color: white;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 16px;
  }
`;

const FormCard = styled(Card)`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  .ant-card-body {
    padding: 40px;
  }
`;

const StepIndicator = styled.div`
  margin-bottom: 40px;
  .ant-steps {
    .ant-steps-item {
      .ant-steps-item-icon {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
      }
      
      .ant-steps-item-title {
        font-weight: 600;
        color: var(--text-tertiary) !important;
        font-size: 14px;
      }
      
      &.ant-steps-item-active {
        .ant-steps-item-icon {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: black;
        }
        .ant-steps-item-title {
            color: white !important;
        }
      }
      
      &.ant-steps-item-finish {
        .ant-steps-item-icon {
          background: transparent;
          border-color: var(--success-color);
          color: var(--success-color);
        }
      }
    }
  }
`;

const FormContainerStyled = styled.div`
  .ant-form-item-label > label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    margin-bottom: 4px;
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    font-size: 16px;
    height: 52px;
    color: white;
    transition: all 0.3s ease;

    &:focus, &:hover {
      border-color: white;
      background: rgba(255, 255, 255, 0.08);
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
      background: rgba(255, 255, 255, 0.05) !important;
      border-radius: 14px !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      padding: 8px 12px !important;
      font-size: 16px !important;
      height: 52px !important;
      color: white !important;
      transition: all 0.3s ease !important;

      &:focus, &:hover {
        border-color: white !important;
        background: rgba(255, 255, 255, 0.08) !important;
      }
      
      .ant-select-selection-item {
          color: white !important;
          display: flex;
          align-items: center;
      }
    }
  }

  .ant-picker {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    font-size: 16px;
    height: 52px;
    color: white;

    .ant-picker-input > input {
        color: white;
    }

    &:focus, &:hover {
      border-color: white;
    }
  }

  .ant-input-number {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 16px;
    height: 52px;
    color: white;

    .ant-input-number-input {
      height: 48px;
      color: white;
    }

    &:focus, &:hover {
      border-color: white;
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
  height: 52px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  background: white;
  border: none;
  color: black;
  transition: all 0.3s ease;
  padding: 0 32px;

  &:hover {
    background: #e6e6e6 !important;
    color: black !important;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  height: 52px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 15px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  padding: 0 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: white !important;
    color: white !important;
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
              placeholder="Select your birth date"
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
        </FormContainerStyled>
      )
    },
    {
      title: 'Eligibility Info',
      content: (
        <FormContainerStyled>
          <Form.Item
            name="age"
            label="Your Age"
            rules={[{ required: true, message: 'Please enter your age' }]}
          >
            <InputNumber
              min={18}
              max={80}
              style={{ width: '100%' }}
              placeholder="Enter your age"
            />
          </Form.Item>

          <Form.Item
            name="annualIncome"
            label="Annual Income (INR)"
            rules={[{ required: true, message: 'Please enter your annual income' }]}
          >
            <Select placeholder="Select your annual income range">
              <Option value="200000">Below ₹2 Lakh</Option>
              <Option value="300000">₹2-3 Lakh</Option>
              <Option value="500000">₹3-5 Lakh</Option>
              <Option value="800000">₹5-8 Lakh</Option>
              <Option value="1200000">₹8-12 Lakh</Option>
              <Option value="2000000">₹12-20 Lakh</Option>
              <Option value="3000000">₹20-30 Lakh</Option>
              <Option value="5000000">Above ₹30 Lakh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="employmentType"
            label="Employment Type"
            rules={[{ required: true, message: 'Please select your employment type' }]}
          >
            <Select placeholder="Select your employment type">
              <Option value="Salaried">Salaried Employee</Option>
              <Option value="Self-employed">Self-employed/Business Owner</Option>
              <Option value="Professional">Professional (Doctor, CA, etc.)</Option>
              <Option value="Freelancer">Freelancer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="creditScore"
            label="Credit Score (if known)"
            tooltip="Your CIBIL score. If you don't know, we'll estimate based on your profile."
          >
            <Select placeholder="Select your approximate credit score" allowClear>
              <Option value="300">Poor (300-549)</Option>
              <Option value="600">Fair (550-649)</Option>
              <Option value="700">Good (650-749)</Option>
              <Option value="800">Excellent (750+)</Option>
              <Option value="">I don't know my credit score</Option>
            </Select>
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
              formatter={value => `INR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/INR\s?|(,*)/g, '')}
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
        </FormContainerStyled>
      )
    }
  ];

  const getRecommendations = (userPreferences) => {
    // Enhanced scoring system with multiple factors
    const scoredCards = creditCards.map(card => {
      let score = 0;
      let eligibilityScore = 0;
      let personalizedScore = 0;

      // 1. ELIGIBILITY SCORING (40% weight)
      if (card.eligibility) {
        const age = parseInt(userPreferences.age) || 25;
        const income = parseFloat(userPreferences.annualIncome) || 300000;
        const creditScore = parseInt(userPreferences.creditScore) || 650;

        // Age eligibility
        if (age >= card.eligibility.min_age && age <= card.eligibility.max_age) {
          eligibilityScore += 25;
        }

        // Income eligibility with bonus for higher income
        if (income >= card.eligibility.min_income) {
          eligibilityScore += 25;
          if (income > card.eligibility.min_income * 1.5) {
            eligibilityScore += 10; // Bonus for well-qualified applicants
          }
        }

        // Credit score matching
        if (creditScore >= card.eligibility.credit_score_min) {
          eligibilityScore += 20;
          if (creditScore > card.eligibility.credit_score_min + 50) {
            eligibilityScore += 10; // Bonus for excellent credit
          }
        }

        // Employment type matching
        if (userPreferences.employmentType &&
          card.eligibility.employment_type.includes(userPreferences.employmentType)) {
          eligibilityScore += 10;
        }
      }

      // 2. PERSONALIZED PREFERENCE SCORING (35% weight)
      // Spending category matching with weighted importance
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
          personalizedScore += card.ratings[mappedCategory] * 3; // Higher weight for category match
        }
      });

      // Card type preference matching
      userPreferences.cardType?.forEach(type => {
        if (card.card_type?.toLowerCase() === type.toLowerCase() ||
          card.special_remarks.toLowerCase().includes(type.toLowerCase())) {
          personalizedScore += 20;
        }
      });

      // Bank preference matching
      if (userPreferences.bankPreference) {
        userPreferences.bankPreference.forEach(bank => {
          if (card.bank?.toLowerCase().includes(bank.toLowerCase()) ||
            card.name.toLowerCase().includes(bank.toLowerCase())) {
            personalizedScore += 15;
          }
        });
      }

      // 3. SPENDING PATTERN ANALYSIS (15% weight)
      const monthlySpend = parseFloat(userPreferences.monthlySpend || 0);
      let spendingScore = 0;

      // Match card tier to spending level
      if (monthlySpend > 100000) { // High spender
        if (card.card_type === 'Premium' || card.annual_charges.includes('10,000')) {
          spendingScore += 25;
        }
      } else if (monthlySpend > 50000) { // Medium spender
        if (card.card_type === 'Travel' || card.card_type === 'Rewards') {
          spendingScore += 20;
        }
      } else { // Low spender
        if (card.card_type === 'Cashback' || card.annual_charges.includes('0')) {
          spendingScore += 20;
        }
      }

      // 4. FEATURE MATCHING (10% weight)
      let featureScore = 0;
      if (userPreferences.additionalFeatures) {
        userPreferences.additionalFeatures.forEach(feature => {
          if (card.key_benefits.toLowerCase().includes(feature.toLowerCase())) {
            featureScore += 8;
          }
        });
      }

      // Calculate weighted total score
      const totalScore = (eligibilityScore * 0.4) + (personalizedScore * 0.35) +
        (spendingScore * 0.15) + (featureScore * 0.1);

      // Calculate approval probability based on eligibility
      let approvalChance = 0;
      if (card.eligibility) {
        const age = parseInt(userPreferences.age) || 25;
        const income = parseFloat(userPreferences.annualIncome) || 300000;
        const creditScore = parseInt(userPreferences.creditScore) || 650;

        if (age >= card.eligibility.min_age && age <= card.eligibility.max_age) approvalChance += 25;
        if (income >= card.eligibility.min_income) {
          approvalChance += 35;
          if (income > card.eligibility.min_income * 2) approvalChance += 10;
        }
        if (creditScore >= card.eligibility.credit_score_min) {
          approvalChance += 30;
          if (creditScore > card.eligibility.credit_score_min + 100) approvalChance += 10;
        }
        if (userPreferences.employmentType &&
          card.eligibility.employment_type.includes(userPreferences.employmentType)) {
          approvalChance += 10;
        }
      } else {
        approvalChance = 70; // Default for cards without eligibility data
      }

      return {
        ...card,
        score: totalScore,
        matchPercentage: Math.min(Math.round(totalScore), 100),
        approvalChance: Math.min(Math.round(approvalChance), 95), // Cap at 95%
        eligibilityMet: eligibilityScore >= 50 // At least 50% eligibility criteria met
      };
    });

    // Sort by score and return top recommendations
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

      // Set loading state... (assuming there's a setRecommendationsLoading if needed, but for now we'll just handle the response)

      // Get recommendations from backend
      try {
        const recResponse = await fetch('/api/credit-cards/recommend-enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formValues)
        });

        const recData = await recResponse.json();

        if (recResponse.ok && recData.success) {
          const fetchedRecommendations = recData.recommendations;
          console.log('Recommendations from backend:', fetchedRecommendations);

          if (fetchedRecommendations.length === 0) {
            message.warning('No matching credit cards found. Please adjust your preferences.');
            return;
          }

          // Set recommendations
          setRecommendations(fetchedRecommendations);
        } else {
          throw new Error(recData.message || 'Failed to fetch recommendations');
        }
      } catch (recError) {
        console.error('Recommendation fetch error:', recError);
        message.warning('Could not get personalized recommendations. Falling back to basics.');
        // Optional: fallback to local logic if critical
        const fallbackRecs = getRecommendations(formValues);
        setRecommendations(fallbackRecs);
      }

      // Submit form data to backend with recommendations
      try {
        const submissionData = {
          ...formValues,
          recommendedCards: recommendations,
          recommendationScore: recommendations.length > 0 ?
            (recommendations.reduce((sum, card) => sum + (card.overallRating || 7), 0) / recommendations.length).toFixed(2) :
            null
        };

        const response = await fetch('/api/credit-card-submissions/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(submissionData)
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Credit card form submitted:', data);
          message.success('Form submitted successfully! Here are your recommended cards.');
        } else {
          throw new Error(data.error || 'Failed to submit form');
        }
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