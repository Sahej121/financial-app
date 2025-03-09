import React, { useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, InputNumber, Radio, Typography, Row, Col, Divider, Progress, Statistic, Alert } from 'antd';
import { MoneyCollectOutlined, SafetyOutlined, BankOutlined, CalculatorOutlined, LineChartOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Line, Pie } from '@ant-design/plots';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const StyledCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ResultCard = styled(Card)`
  margin-top: 24px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
`;

const MetricCard = styled(Card)`
  margin: 12px 0;
  text-align: center;
`;

const ChartContainer = styled.div`
  margin: 24px 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
`;

const FinancialPlanningFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [planningType, setPlanningType] = useState(null);
  const [form] = Form.useForm();
  const [recommendations, setRecommendations] = useState(null);

  const steps = [
    {
      title: 'Select Goal',
      icon: <CalculatorOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={3}>What's your financial goal?</Title>
          <Paragraph>Choose the type of financial planning you need help with</Paragraph>
          <Radio.Group 
            size="large" 
            onChange={(e) => setPlanningType(e.target.value)}
            value={planningType}
            style={{ marginTop: 20 }}
          >
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12}>
                <Radio.Button 
                  value="business" 
                  style={{ width: '100%', height: '120px', padding: '20px', textAlign: 'center' }}
                >
                  <MoneyCollectOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }} />
                  Business Expansion
                </Radio.Button>
              </Col>
              <Col xs={24} sm={12}>
                <Radio.Button 
                  value="loan" 
                  style={{ width: '100%', height: '120px', padding: '20px', textAlign: 'center' }}
                >
                  <SafetyOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }} />
                  Loan Protection
                </Radio.Button>
              </Col>
            </Row>
          </Radio.Group>
        </div>
      )
    },
    {
      title: 'Details',
      icon: <BankOutlined />,
      content: (
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          {planningType === 'business' ? (
            <>
              <Form.Item
                name="businessType"
                label="Type of Business"
                rules={[{ required: true, message: 'Please select your business type' }]}
              >
                <Select placeholder="Select your business type">
                  <Option value="retail">Retail</Option>
                  <Option value="service">Service</Option>
                  <Option value="manufacturing">Manufacturing</Option>
                  <Option value="tech">Technology</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="currentRevenue"
                label="Current Monthly Revenue"
                rules={[{ required: true, message: 'Please enter your current revenue' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter amount"
                />
              </Form.Item>

              <Form.Item
                name="expansionGoal"
                label="Target Monthly Revenue"
                rules={[{ required: true, message: 'Please enter your target revenue' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter target amount"
                />
              </Form.Item>

              <Form.Item
                name="timeframe"
                label="Desired Timeframe for Expansion"
                rules={[{ required: true, message: 'Please select your timeframe' }]}
              >
                <Select placeholder="Select timeframe">
                  <Option value="6">6 months</Option>
                  <Option value="12">1 year</Option>
                  <Option value="24">2 years</Option>
                  <Option value="36">3 years</Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="loanType"
                label="Type of Loan"
                rules={[{ required: true, message: 'Please select your loan type' }]}
              >
                <Select placeholder="Select loan type">
                  <Option value="personal">Personal Loan</Option>
                  <Option value="business">Business Loan</Option>
                  <Option value="home">Home Loan</Option>
                  <Option value="education">Education Loan</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="loanAmount"
                label="Total Loan Amount"
                rules={[{ required: true, message: 'Please enter the loan amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter loan amount"
                />
              </Form.Item>

              <Form.Item
                name="interestRate"
                label="Interest Rate (%)"
                rules={[{ required: true, message: 'Please enter the interest rate' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={30}
                  step={0.1}
                  placeholder="Enter interest rate"
                />
              </Form.Item>

              <Form.Item
                name="tenure"
                label="Loan Tenure (Years)"
                rules={[{ required: true, message: 'Please select the loan tenure' }]}
              >
                <Select placeholder="Select loan tenure">
                  <Option value="5">5 years</Option>
                  <Option value="10">10 years</Option>
                  <Option value="15">15 years</Option>
                  <Option value="20">20 years</Option>
                  <Option value="30">30 years</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="monthlyIncome"
                label="Monthly Income"
                rules={[{ required: true, message: 'Please enter your monthly income' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter monthly income"
                />
              </Form.Item>
            </>
          )}
        </Form>
      )
    }
  ];

  const generateRecommendations = (values) => {
    if (planningType === 'business') {
      const monthlyGrowthNeeded = ((values.expansionGoal - values.currentRevenue) / values.currentRevenue) / parseInt(values.timeframe);
      const monthlyInvestmentNeeded = (values.expansionGoal - values.currentRevenue) * 0.3;
      const breakEvenMonths = Math.ceil(monthlyInvestmentNeeded / (values.expansionGoal - values.currentRevenue));
      const riskLevel = monthlyGrowthNeeded > 0.5 ? 'High' : monthlyGrowthNeeded > 0.2 ? 'Medium' : 'Low';
      
      const growthData = Array.from({ length: parseInt(values.timeframe) + 1 }, (_, i) => ({
        month: i,
        revenue: values.currentRevenue * (1 + monthlyGrowthNeeded) ** i
      }));

      return {
        title: 'Business Expansion Plan',
        metrics: {
          monthlyGrowth: (monthlyGrowthNeeded * 100).toFixed(2),
          monthlyInvestment: monthlyInvestmentNeeded.toFixed(2),
          breakEvenMonths,
          riskLevel
        },
        charts: {
          growthProjection: growthData,
          investmentBreakdown: [
            { type: 'Marketing', value: 40 },
            { type: 'Equipment', value: 30 },
            { type: 'Staff', value: 20 },
            { type: 'Operations', value: 10 }
          ]
        },
        recommendations: [
          `Target Monthly Growth Rate: ${(monthlyGrowthNeeded * 100).toFixed(2)}%`,
          `Estimated Monthly Investment Needed: ₹${monthlyInvestmentNeeded.toFixed(2)}`,
          `Expected Break-even Period: ${breakEvenMonths} months`,
          `Risk Level: ${riskLevel}`,
          'Key Action Items:',
          '• Develop a detailed market expansion strategy',
          '• Invest in marketing and customer acquisition',
          '• Consider hiring additional staff or upgrading equipment',
          '• Explore business loan options if needed',
          '• Set up monthly progress tracking metrics',
          'Risk Mitigation:',
          '• Maintain emergency fund of 3 months operating expenses',
          '• Diversify revenue streams',
          '• Consider business insurance',
          '• Develop contingency plans'
        ]
      };
    } else {
      const monthlyEMI = calculateEMI(values.loanAmount, values.interestRate, values.tenure);
      const recommendedEMI = values.monthlyIncome * 0.4;
      const isEMISafe = monthlyEMI <= recommendedEMI;
      const totalInterest = (monthlyEMI * values.tenure * 12) - values.loanAmount;
      const debtToIncomeRatio = (monthlyEMI / values.monthlyIncome) * 100;
      
      const emiData = Array.from({ length: values.tenure * 12 }, (_, i) => {
        const remainingLoan = calculateRemainingLoan(values.loanAmount, values.interestRate, values.tenure, i);
        return {
          month: i,
          principal: values.loanAmount - remainingLoan,
          interest: (monthlyEMI * i) - (values.loanAmount - remainingLoan)
        };
      });

      return {
        title: 'Loan Protection Plan',
        metrics: {
          monthlyEMI,
          totalInterest,
          debtToIncomeRatio: debtToIncomeRatio.toFixed(2),
          safetyStatus: isEMISafe
        },
        charts: {
          emiBreakdown: emiData,
          expenseBreakdown: [
            { type: 'EMI', value: monthlyEMI },
            { type: 'Available Income', value: values.monthlyIncome - monthlyEMI }
          ]
        },
        recommendations: [
          `Monthly EMI: ₹${monthlyEMI.toFixed(2)}`,
          `Total Interest Payable: ₹${totalInterest.toFixed(2)}`,
          `Debt-to-Income Ratio: ${debtToIncomeRatio.toFixed(2)}%`,
          `Maximum Recommended EMI (40% of income): ₹${recommendedEMI.toFixed(2)}`,
          `EMI Status: ${isEMISafe ? '✅ Safe' : '⚠️ High Risk'}`,
          'Financial Health Indicators:',
          `• EMI to Income Ratio: ${((monthlyEMI/values.monthlyIncome) * 100).toFixed(2)}%`,
          `• Monthly Savings Potential: ₹${(values.monthlyIncome - monthlyEMI).toFixed(2)}`,
          'Recommendations:',
          isEMISafe ? 
            '• Your EMI is within safe limits' : 
            '• Consider extending loan tenure or making a larger down payment',
          '• Set up an emergency fund of 6 months EMI',
          '• Consider loan protection insurance',
          '• Set up automatic payments to avoid delays',
          '• Maintain a good credit score for future refinancing options',
          'Risk Management:',
          '• Create an emergency fund',
          '• Review and optimize other expenses',
          '• Consider income protection insurance',
          '• Monitor credit score regularly'
        ]
      };
    }
  };

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / (12 * 100);
    const totalMonths = tenure * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
           (Math.pow(1 + monthlyRate, totalMonths) - 1);
  };

  const calculateRemainingLoan = (principal, rate, tenure, month) => {
    const monthlyRate = rate / (12 * 100);
    const totalMonths = tenure * 12;
    const emi = calculateEMI(principal, rate, tenure);
    return (principal * (1 + monthlyRate) ** totalMonths - emi * ((1 + monthlyRate) ** month - 1)) / (1 + monthlyRate) ** (totalMonths - month);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!planningType) {
        return;
      }
      setCurrentStep(1);
    } else {
      try {
        const values = await form.validateFields();
        const recommendations = generateRecommendations(values);
        setRecommendations(recommendations);
      } catch (error) {
        console.error('Validation failed:', error);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setRecommendations(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <StyledCard>
        <Steps current={currentStep} style={{ marginBottom: 40 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        {steps[currentStep].content}

        <Divider />

        <div style={{ textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev}>
              Previous
            </Button>
          )}
          <Button 
            type="primary" 
            onClick={handleNext}
            disabled={currentStep === 0 && !planningType}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Generate Plan'}
          </Button>
        </div>
      </StyledCard>

      {recommendations && (
        <ResultCard>
          <Title level={3}>{recommendations.title}</Title>
          
          <Row gutter={[16, 16]}>
            {Object.entries(recommendations.metrics).map(([key, value]) => (
              <Col xs={24} sm={12} md={6} key={key}>
                <MetricCard>
                  <Statistic
                    title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={value}
                    suffix={key.includes('percentage') ? '%' : ''}
                    prefix={key.includes('amount') ? '₹' : ''}
                  />
                </MetricCard>
              </Col>
            ))}
          </Row>

          <ChartContainer>
            <Title level={4}>Growth Projection</Title>
            {planningType === 'business' ? (
              <Line
                data={recommendations.charts.growthProjection}
                xField="month"
                yField="revenue"
                smooth
                point={{ size: 5, shape: 'diamond' }}
              />
            ) : (
              <Line
                data={recommendations.charts.emiBreakdown}
                xField="month"
                yField={['principal', 'interest']}
                smooth
              />
            )}
          </ChartContainer>

          <ChartContainer>
            <Title level={4}>{planningType === 'business' ? 'Investment Breakdown' : 'Monthly Income Breakdown'}</Title>
            <Pie
              data={planningType === 'business' ? 
                recommendations.charts.investmentBreakdown :
                recommendations.charts.expenseBreakdown}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'spider',
                content: '{name}: {percentage}',
                style: {
                  fontSize: 14
                }
              }}
              legend={{
                position: 'bottom'
              }}
            />
          </ChartContainer>

          <Alert
            message="Recommendations"
            description={
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recommendations.recommendations.map((rec, index) => (
                  <li key={index} style={{ margin: '8px 0' }}>
                    {rec.startsWith('•') ? (
                      <span style={{ marginLeft: 20 }}>{rec}</span>
                    ) : (
                      <strong>{rec}</strong>
                    )}
                  </li>
                ))}
              </ul>
            }
            type="success"
            showIcon
          />
        </ResultCard>
      )}
    </div>
  );
};

export default FinancialPlanningFlow; 