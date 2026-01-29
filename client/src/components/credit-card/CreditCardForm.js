import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Steps, message, Radio } from 'antd';
import { useSelector } from 'react-redux';
import InteractiveCard from './InteractiveCard';
import styled from 'styled-components';
import CreditCardRecommendations from './CreditCardRecommendations';
import creditCards from './creditCardData';
import api from '../../services/api';

const { Step } = Steps;
const { Option } = Select;

const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 60px;
  position: relative;
  
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 20px;
  }
`;

const StepsStyled = styled(Steps)`
  margin-bottom: 48px;
  
  .ant-steps-item-title {
    color: rgba(255, 255, 255, 0.4) !important;
    font-weight: 600 !important;
    font-size: 14px !important;
  }
  
  .ant-steps-item-active .ant-steps-item-title {
    color: white !important;
  }
  
  .ant-steps-item-finish .ant-steps-item-title {
    color: #40a9ff !important;
  }

  .ant-steps-item-icon {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
    
    .ant-steps-icon {
      color: rgba(255, 255, 255, 0.4) !important;
    }
  }

  .ant-steps-item-active .ant-steps-item-icon {
    background: #00B0F0 !important;
    border-color: #00B0F0 !important;
    
    .ant-steps-icon {
      color: white !important;
    }
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background: transparent !important;
    border-color: #52c41a !important;
    
    .ant-steps-icon {
      color: #52c41a !important;
    }
  }
`;

const FormSection = styled.div`
  flex: 1;
  z-index: 1;
`;

const CardSection = styled.div`
  width: 520px;
  padding-top: 20px;
  z-index: 1;
  position: sticky;
  top: 100px;
  height: fit-content;
  
  @media (max-width: 1000px) {
    width: 100%;
    position: relative;
    top: 0;
    order: -1;
  }
`;

const WelcomeText = styled.div`
  text-align: left;
  padding-bottom: 32px;
  
  h1 {
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

const FormContainerStyled = styled.div`
  .ant-form-item-label > label {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .ant-input, .ant-input-affix-wrapper, .ant-select-selector, .ant-picker, .ant-input-number {
    background: rgba(255, 255, 255, 0.03) !important;
    border-radius: 16px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    padding: 0 !important; /* Reset padding for wrapper */
    font-size: 16px !important;
    height: 56px !important;
    width: 100% !important;
    color: white !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: flex;
    align-items: center;

    &:hover {
      border-color: rgba(255, 255, 255, 0.3) !important;
      background: rgba(255, 255, 255, 0.05) !important;
    }

    &:focus, &.ant-input-focused, &.ant-select-focused, &.ant-input-number-focused {
      border-color: #00B0F0 !important;
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 20px rgba(0, 176, 240, 0.15) !important;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3) !important;
    }

    /* Target internal input elements */
    input {
      background: transparent !important;
      color: white !important;
      height: 100% !important;
      padding: 12px 20px !important;
      width: 100% !important;
      border: none !important;
      box-shadow: none !important;
    }

    &.ant-input-number {
      .ant-input-number-input-wrap {
        height: 100%;
        width: 100%;
      }
      
      .ant-input-number-input {
        padding: 12px 20px !important;
        height: 54px !important; /* Slightly less than wrapper to account for border */
      }

      .ant-input-number-handler-wrap {
        background: rgba(255, 255, 255, 0.05) !important;
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 0 16px 16px 0 !important;
        width: 32px !important;
        
        .ant-input-number-handler {
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          
          &:hover {
            color: #00B0F0 !important;
          }
        }
      }
    }
  }

  .ant-select-selection-item {
    color: white !important;
    font-weight: 500;
  }

  .ant-radio-group {
    display: flex;
    gap: 12px;
    width: 100%;
    
    .ant-radio-button-wrapper {
      flex: 1;
      height: 56px;
      line-height: 54px;
      text-align: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px !important;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
      
      &::before { display: none; }

      &:hover {
        color: white;
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      &.ant-radio-button-wrapper-checked {
        background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
        border-color: #00B0F0;
        color: white;
        font-weight: 700;
        box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);
      }
    }
  }
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(20px);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
`;

const NavButtons = styled.div`
  margin-top: 40px;
  display: flex;
  gap: 16px;

  .ant-btn {
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 700;
    transition: all 0.3s ease;
    
    &.ant-btn-primary {
      background: linear-gradient(135deg, #00B0F0 0%, #0070C0 100%);
      border: none;
      box-shadow: 0 10px 20px rgba(0, 176, 240, 0.2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(0, 176, 240, 0.3);
      }
    }

    &.ant-btn-default {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

const SectionDivider = styled.div`
  margin: 40px 0 24px 0;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    color: white;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
  }
`;

const CreditCardForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
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
      title: 'Financial Profile',
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

          <SectionDivider>
            <h3>Banking & Credit History</h3>
          </SectionDivider>

          <Form.Item
            name="hasExistingCard"
            label="Do you currently have any credit cards?"
            rules={[{ required: true, message: 'Please select an option' }]}
          >
            <Radio.Group>
              <Radio.Button value="yes">Yes</Radio.Button>
              <Radio.Button value="no">No</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.hasExistingCard !== currentValues.hasExistingCard
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('hasExistingCard') === 'yes' ? (
                <Form.Item
                  name="existingCardsCount"
                  label="How many credit cards do you have?"
                  rules={[{ required: true, message: 'Please select number of cards' }]}
                >
                  <Select placeholder="Select number of cards">
                    <Option value="1">1 Card</Option>
                    <Option value="2">2 Cards</Option>
                    <Option value="3-4">3-4 Cards</Option>
                    <Option value="5+">5+ Cards</Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="primaryBank"
            label="Primary Bank (where you have savings account)"
            rules={[{ required: true, message: 'Please select your primary bank' }]}
          >
            <Select placeholder="Select your primary bank">
              <Option value="hdfc">HDFC Bank</Option>
              <Option value="icici">ICICI Bank</Option>
              <Option value="axis">Axis Bank</Option>
              <Option value="sbi">State Bank of India</Option>
              <Option value="kotak">Kotak Mahindra Bank</Option>
              <Option value="indusind">IndusInd Bank</Option>
              <Option value="yes">Yes Bank</Option>
              <Option value="other">Other Bank</Option>
            </Select>
          </Form.Item>
        </FormContainerStyled>
      )
    },
    {
      title: 'Spending & Preferences',
      content: (
        <FormContainerStyled>
          <Form.Item
            name="monthlySpend"
            label="Expected Monthly Spend on Credit Card"
            rules={[
              { required: true, message: 'Please enter your expected monthly spend' },
              { type: 'number', min: 5000, message: 'Monthly spend should be at least ₹5,000' }
            ]}
          >
            <InputNumber
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              min={5000}
              step={1000}
              placeholder="Enter amount in INR"
            />
          </Form.Item>

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

          <SectionDivider>
            <h3>Travel & Lifestyle</h3>
          </SectionDivider>

          <Form.Item
            name="domesticTravelFrequency"
            label="Domestic Travel Frequency"
            rules={[{ required: true, message: 'Please select travel frequency' }]}
          >
            <Select placeholder="How often do you travel within India?">
              <Option value="never">Never / Rarely</Option>
              <Option value="1-2">1-2 times per year</Option>
              <Option value="3-6">3-6 times per year</Option>
              <Option value="monthly">Monthly or more</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="internationalTravelFrequency"
            label="International Travel Frequency"
            rules={[{ required: true, message: 'Please select international travel frequency' }]}
          >
            <Select placeholder="How often do you travel abroad?">
              <Option value="never">Never / Rarely</Option>
              <Option value="1-2">1-2 times per year</Option>
              <Option value="3-6">3-6 times per year</Option>
              <Option value="frequent">More than 6 times per year</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="onlineShoppingPlatforms"
            label="Primary Online Shopping Platforms"
            tooltip="Select platforms where you shop frequently"
          >
            <Select
              mode="multiple"
              placeholder="Select your preferred platforms (optional)"
            >
              <Option value="amazon">Amazon</Option>
              <Option value="flipkart">Flipkart</Option>
              <Option value="myntra">Myntra</Option>
              <Option value="ajio">Ajio</Option>
              <Option value="swiggy">Swiggy</Option>
              <Option value="zomato">Zomato</Option>
              <Option value="bookmyshow">BookMyShow</Option>
              <Option value="makemytrip">MakeMyTrip</Option>
            </Select>
          </Form.Item>
        </FormContainerStyled>
      )
    },
    {
      title: 'Reward Preferences',
      content: (
        <FormContainerStyled>
          <Form.Item
            name="rewardPreference"
            label="How do you prefer to earn rewards?"
            rules={[{ required: true, message: 'Please select reward preference' }]}
          >
            <Radio.Group>
              <Radio.Button value="cashback">Cashback (Direct money back)</Radio.Button>
              <Radio.Button value="points">Reward Points (Flexible redemption)</Radio.Button>
              <Radio.Button value="travel">Travel Miles/Benefits</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="maxAnnualFee"
            label="Maximum Annual Fee You're Comfortable With"
            rules={[{ required: true, message: 'Please select maximum annual fee' }]}
          >
            <Select placeholder="Select maximum annual fee">
              <Option value="0">₹0 (Only free cards)</Option>
              <Option value="500">Up to ₹500</Option>
              <Option value="1000">Up to ₹1,000</Option>
              <Option value="2500">Up to ₹2,500</Option>
              <Option value="5000">Up to ₹5,000</Option>
              <Option value="10000">Up to ₹10,000</Option>
              <Option value="unlimited">Above ₹10,000 (Premium cards)</Option>
            </Select>
          </Form.Item>

          <SectionDivider>
            <h3>Additional Preferences</h3>
          </SectionDivider>

          <Form.Item
            name="bankPreference"
            label="Preferred Banks (Optional)"
            tooltip="We'll prioritize cards from these banks if you have existing relationship"
          >
            <Select
              mode="multiple"
              placeholder="Select preferred banks (optional)"
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
            label="Important Card Features (Optional)"
          >
            <Select
              mode="multiple"
              placeholder="Select important features"
            >
              <Option value="lounge">Airport Lounge Access</Option>
              <Option value="insurance">Insurance Coverage</Option>
              <Option value="emi">EMI Options</Option>
              <Option value="forex">Low Forex Markup</Option>
              <Option value="welcome">Welcome Benefits</Option>
              <Option value="movie">Movie Ticket Offers</Option>
              <Option value="concierge">Concierge Services</Option>
            </Select>
          </Form.Item>
        </FormContainerStyled>
      )
    }
  ];

  const getRecommendations = (userPreferences) => {
    const scoredCards = creditCards.map(card => {
      let eligibilityScore = 0;
      let personalizedScore = 0;

      // 1. ELIGIBILITY SCORING (35% weight)
      if (card.eligibility) {
        const age = parseInt(userPreferences.age) || 25;
        const income = parseFloat(userPreferences.annualIncome) || 300000;
        const creditScore = parseInt(userPreferences.creditScore) || 650;

        if (age >= card.eligibility.min_age && age <= card.eligibility.max_age) {
          eligibilityScore += 20;
        }

        if (income >= card.eligibility.min_income) {
          eligibilityScore += 25;
          if (income > card.eligibility.min_income * 1.5) {
            eligibilityScore += 10;
          }
        }

        if (creditScore >= card.eligibility.credit_score_min) {
          eligibilityScore += 20;
          if (creditScore > card.eligibility.credit_score_min + 50) {
            eligibilityScore += 10;
          }
        }

        if (userPreferences.employmentType &&
          card.eligibility.employment_type.includes(userPreferences.employmentType)) {
          eligibilityScore += 10;
        }
      }

      // 2. ENHANCED PERSONALIZED SCORING (40% weight)
      if (userPreferences.hasExistingCard === 'no' && card.card_type === 'Cashback') {
        personalizedScore += 15;
      }

      if (userPreferences.primaryBank &&
        card.bank?.toLowerCase().includes(userPreferences.primaryBank.toLowerCase())) {
        personalizedScore += 25;
      }

      const domesticTravel = userPreferences.domesticTravelFrequency || 'never';
      const intlTravel = userPreferences.internationalTravelFrequency || 'never';

      if ((domesticTravel === 'monthly' || intlTravel === 'frequent' || intlTravel === '3-6') &&
        (card.card_type === 'Travel' || card.ratings.travel >= 8)) {
        personalizedScore += 30;
      } else if ((domesticTravel === 'never' && intlTravel === 'never') &&
        card.card_type === 'Travel') {
        personalizedScore -= 20;
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

        const mappedCategory = categoryMapping[category];
        if (card.ratings[mappedCategory]) {
          personalizedScore += card.ratings[mappedCategory] * 3;
        }
      });

      if (userPreferences.onlineShoppingPlatforms?.length > 0 &&
        (card.key_benefits.toLowerCase().includes('amazon') ||
          card.key_benefits.toLowerCase().includes('flipkart') ||
          card.key_benefits.toLowerCase().includes('online'))) {
        personalizedScore += 15;
      }

      userPreferences.cardType?.forEach(type => {
        if (card.card_type?.toLowerCase() === type.toLowerCase() ||
          card.special_remarks.toLowerCase().includes(type.toLowerCase())) {
          personalizedScore += 20;
        }
      });

      // 3. REWARD PREFERENCE MATCHING (15% weight)
      let rewardScore = 0;
      const rewardPref = userPreferences.rewardPreference;

      if (rewardPref === 'cashback' && card.card_type === 'Cashback') {
        rewardScore += 30;
      } else if (rewardPref === 'travel' && card.card_type === 'Travel') {
        rewardScore += 30;
      } else if (rewardPref === 'points' && card.card_type === 'Rewards') {
        rewardScore += 30;
      }

      // 4. ANNUAL FEE FILTERING (10% weight)
      let feeScore = 0;
      const maxFee = parseInt(userPreferences.maxAnnualFee) || 0;
      const cardFee = parseInt(card.annual_charges?.replace(/[^0-9]/g, '') || '0');

      if (maxFee === 0 && cardFee === 0) {
        feeScore += 25;
      } else if (cardFee <= maxFee) {
        feeScore += 20;
      } else if (cardFee > maxFee) {
        feeScore -= 30;
      }

      const totalScore = (eligibilityScore * 0.35) + (personalizedScore * 0.40) +
        (rewardScore * 0.15) + (feeScore * 0.10);

      // Calculate approval probability
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

        if (userPreferences.primaryBank &&
          card.bank?.toLowerCase().includes(userPreferences.primaryBank.toLowerCase())) {
          approvalChance += 15;
        }
      } else {
        approvalChance = 70;
      }

      return {
        ...card,
        matchPercentage: Math.min(Math.round(totalScore), 100),
        approvalChance: Math.min(Math.round(approvalChance), 95),
        eligibilityMet: eligibilityScore >= 50
      };
    });

    return scoredCards
      .filter(card => card.matchPercentage > 30)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);
  };

  const next = async () => {
    try {
      const currentStepFields = [];
      const content = steps[currentStep].content.props.children;

      const extractFields = (element) => {
        if (!element) return;

        if (Array.isArray(element)) {
          element.forEach(extractFields);
        } else if (element.props) {
          if (element.props.name && element.props.name !== 'dob') {
            currentStepFields.push(element.props.name);
          }
          if (element.props.children) {
            extractFields(element.props.children);
          }
        }
      };

      extractFields(content);

      await form.validateFields(currentStepFields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errorFields) {
        message.error(error.errorFields[0].errors[0]);
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
      const formValues = {
        ...values,
        monthlySpend: values.monthlySpend ? parseFloat(values.monthlySpend) : 0,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
        cardType: values.cardType || [],
        spendingCategories: values.spendingCategories || [],
        bankPreference: values.bankPreference || [],
        additionalFeatures: values.additionalFeatures || [],
        onlineShoppingPlatforms: values.onlineShoppingPlatforms || []
      };

      let fetchedRecommendations = [];

      try {
        const recResponse = await api.post('/credit-cards/recommend-enhanced', formValues);

        if (recResponse.data && recResponse.data.success) {
          fetchedRecommendations = recResponse.data.recommendations;
        } else {
          throw new Error(recResponse.data.message || 'Failed to fetch recommendations');
        }
      } catch (recError) {
        console.error('Recommendation fetch error:', recError);
        message.warning('Using local recommendation engine.');
        fetchedRecommendations = getRecommendations(formValues);
      }

      if (fetchedRecommendations.length === 0) {
        message.warning('No matching credit cards found. Please adjust your preferences.');
        return;
      }

      setRecommendations(fetchedRecommendations);

      try {
        const submissionData = {
          ...formValues,
          recommendedCards: fetchedRecommendations,
          recommendationScore: fetchedRecommendations.length > 0 ?
            (fetchedRecommendations.reduce((sum, card) => sum + (card.matchPercentage || 70), 0) / fetchedRecommendations.length).toFixed(2) :
            null
        };

        const response = await api.post('/credit-card-submissions/submit', submissionData);

        if (response.status === 200 || response.status === 201) {
          message.success('Form submitted successfully! Here are your recommended cards.');
        } else {
          throw new Error(response.data.error || 'Failed to submit form');
        }
      } catch (submitError) {
        console.error('Form submission error:', submitError);
        message.warning('Could not save your preferences, but here are your recommended cards.');
      }
    } catch (error) {
      console.error('Form processing error:', error);
      message.error('There was an error processing your form. Please try again.');
    }
  };

  const handleFormChange = (changedValues, allValues) => {
    setFormData(allValues);

    const relevantFields = ['cardType', 'spendingCategories', 'monthlySpend', 'bankPreference',
      'additionalFeatures', 'rewardPreference', 'domesticTravelFrequency',
      'internationalTravelFrequency', 'maxAnnualFee'];
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
          <h1>Find Your Perfect Credit Card</h1>
          <p>Answer a few questions to get personalized recommendations</p>
        </WelcomeText>

        <FormCard>
          <StepsStyled current={currentStep}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </StepsStyled>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={handleFormChange}
          >
            {steps[currentStep].content}

            <NavButtons>
              {currentStep > 0 && (
                <Button onClick={prev}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={next} style={{ flex: 2 }}>
                  Next Step
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 2 }}>
                  Get My Recommendations
                </Button>
              )}
            </NavButtons>
          </Form>
        </FormCard>

        {recommendations.length > 0 && (
          <CreditCardRecommendations recommendations={recommendations} userPreferences={formData} />
        )}
      </FormSection>
    </FormContainer>
  );
};

export default CreditCardForm;