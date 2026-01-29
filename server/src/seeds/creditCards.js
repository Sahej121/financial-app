const creditCards = [
  {
    name: "HDFC Bank Millennia Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 9, travel: 5, charges: 7, fuel: 4, dining_entertainment: 6, rewards: 8 },
    benefits: ["5% cashback on Amazon/Flipkart", "1% cashback on other spends", "Fuel surcharge waiver"],
    welcomeOffer: "₹500 Cashback on first spend",
    special_remarks: "Online shoppers",
    min_income: 300000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 700, employment_type: ["Salaried", "Self-employed"] },
    application_url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card",
    hidden_charges: "Late payment fee: Up to ₹1,000"
  },
  {
    name: "HDFC Bank Regalia Credit Card",
    annual_charges: "₹2,500 + GST",
    ratings: { shopping: 7, travel: 9, charges: 6, fuel: 5, dining_entertainment: 8, rewards: 8 },
    benefits: ["4 reward points/₹150 spent", "Airport lounge access", "Travel discounts"],
    welcomeOffer: "5000 Reward Points",
    special_remarks: "Frequent travelers",
    min_income: 1200000,
    eligibility: { min_age: 21, max_age: 65, credit_score_min: 750, employment_type: ["Salaried", "Self-employed", "Professional"] },
    application_url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card",
    hidden_charges: "Processing fee: ₹999 on EMI"
  },
  {
    name: "HDFC Bank Diners Club Black Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 6, travel: 10, charges: 5, fuel: 4, dining_entertainment: 9, rewards: 9 },
    benefits: ["5x dining/travel rewards", "Unlimited lounge access", "Golf benefits"],
    welcomeOffer: "10,000 Bonus Points",
    special_remarks: "High-net-worth individuals",
    min_income: 2100000,
    eligibility: { min_age: 21, max_age: 65, credit_score_min: 780, employment_type: ["Salaried", "Professional"] }
  },
  {
    name: "HDFC Bank Infinia Credit Card",
    annual_charges: "₹12,500 + GST",
    ratings: { shopping: 8, travel: 10, charges: 5, fuel: 5, dining_entertainment: 9, rewards: 10 },
    benefits: ["5x all spends rewards", "Concierge services", "Premium lounge access"],
    welcomeOffer: "15,000 Welcome Points",
    special_remarks: "Premium users",
    min_income: 3600000,
    eligibility: { min_age: 21, max_age: 70, credit_score_min: 800, employment_type: ["Salaried", "Professional"] }
  },
  {
    name: "HDFC Bank MoneyBack Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 7, travel: 4, charges: 8, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: ["2x online rewards", "Fuel surcharge waiver", "Entertainment discounts"],
    welcomeOffer: "1000 Bonus Points",
    special_remarks: "Budget users",
    min_income: 240000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 650, employment_type: ["Salaried", "Self-employed", "Student"] }
  },
  {
    name: "HDFC Bank Platinum Times Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 4, charges: 8, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: ["5x dining/entertainment points", "BookMyShow offers", "Fuel waiver"],
    welcomeOffer: "2 Movie Tickets",
    special_remarks: "Movie enthusiasts",
    min_income: 300000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 700, employment_type: ["Salaried"] }
  },
  {
    name: "HDFC Bank Titanium Times Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 6, travel: 4, charges: 7, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: ["5x dining rewards", "Entertainment discounts", "Fuel surcharge waiver"],
    welcomeOffer: "₹1000 Dining Credit",
    special_remarks: "Frequent diners",
    min_income: 300000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 700, employment_type: ["Salaried"] }
  },
  {
    name: "HDFC Bank Tata Neu Infinity Credit Card",
    annual_charges: "₹1,500 + GST",
    ratings: { shopping: 8, travel: 5, charges: 6, fuel: 4, dining_entertainment: 7, rewards: 8 },
    benefits: ["5% NeuCoins on Tata app", "Tata brand discounts", "1.5% general rewards"],
    welcomeOffer: "1000 NeuCoins",
    special_remarks: "Tata users"
  },
  {
    name: "HDFC Bank Paytm First Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 4, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: ["5% Paytm cashback", "Entertainment offers", "1% general cashback"],
    welcomeOffer: "₹250 Cashback",
    special_remarks: "Paytm users"
  },
  {
    name: "HDFC Bank Flipkart Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 4, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: ["5% Flipkart cashback", "1.5% other spends", "Dining discounts"],
    welcomeOffer: "₹500 Flipkart voucher",
    special_remarks: "Flipkart shoppers"
  },
  {
    name: "SBI SimplySAVE Credit Card",
    annual_charges: "₹499 + GST",
    ratings: { shopping: 7, travel: 5, charges: 8, fuel: 6, dining_entertainment: 8, rewards: 7 },
    benefits: ["5x groceries/dining points", "Fuel surcharge waiver", "Movie rewards"],
    welcomeOffer: "1000 Bonus Points",
    special_remarks: "Daily spends",
    min_income: 180000,
    eligibility: { min_age: 21, max_age: 70, credit_score_min: 650, employment_type: ["Salaried", "Self-employed"] }
  },
  {
    name: "SBI SimplyClick Credit Card",
    annual_charges: "₹499 + GST",
    ratings: { shopping: 9, travel: 5, charges: 8, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: ["5x online rewards", "Amazon discounts", "BookMyShow offers"],
    welcomeOffer: "₹500 Amazon voucher",
    special_remarks: "Online shoppers",
    min_income: 240000,
    eligibility: { min_age: 18, max_age: 60, credit_score_min: 680, employment_type: ["Salaried", "Self-employed", "Student"] }
  },
  {
    name: "SBI Elite Credit Card",
    annual_charges: "₹4,999 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: ["4x all spends points", "Lounge access", "Travel discounts"],
    welcomeOffer: "10,000 Welcome Points",
    special_remarks: "Frequent flyers",
    min_income: 1500000,
    eligibility: { min_age: 21, max_age: 65, credit_score_min: 750, employment_type: ["Salaried", "Professional"] }
  },
  {
    name: "SBI Card PRIME",
    annual_charges: "₹2,999 + GST",
    ratings: { shopping: 7, travel: 9, charges: 6, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: ["4x reward points", "Lounge access", "Dining discounts"],
    welcomeOffer: "8000 Bonus Points",
    special_remarks: "Premium users"
  },
  {
    name: "SBI IRCTC Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 5, travel: 8, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: ["5x IRCTC rewards", "Travel discounts", "Fuel surcharge waiver"],
    welcomeOffer: "500 Rail Points",
    special_remarks: "Train travelers"
  },
  {
    name: "SBI Yatra Credit Card",
    annual_charges: "₹1,499 + GST",
    ratings: { shopping: 6, travel: 9, charges: 6, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: ["5x Yatra rewards", "Travel insurance", "Lounge access"],
    welcomeOffer: "₹2000 Travel Voucher",
    special_remarks: "Frequent travelers"
  },
  {
    name: "Paytm SBI Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 4, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: ["5% Paytm cashback", "1% general cashback", "Entertainment offers"],
    welcomeOffer: "₹300 Cashback",
    special_remarks: "Paytm users"
  },
  {
    name: "SBI Aurum Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 7, travel: 10, charges: 5, fuel: 6, dining_entertainment: 9, rewards: 9 },
    benefits: ["5x all spends points", "Concierge service", "Unlimited lounge access"],
    welcomeOffer: "20,000 Bonus Points",
    special_remarks: "High-net-worth individuals"
  },
  {
    name: "ICICI Coral Credit Card",
    annual_charges: "₹499 + GST",
    ratings: { shopping: 6, travel: 8, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 7 },
    benefits: ["2 PayBack points/₹100", "Railway lounge access", "Travel deals"],
    welcomeOffer: "500 Welcome Points",
    special_remarks: "Frequent travelers"
  },
  {
    name: "ICICI Rubyx Credit Card",
    annual_charges: "₹3,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 6, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: ["4x Amex rewards", "2x Visa rewards", "Lounge access"],
    welcomeOffer: "10,000 Bonus Points",
    special_remarks: "Premium users"
  },

  {
    name: "ICICI Sapphiro Credit Card",
    annual_charges: "₹6,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x Amex reward points",
      "2x Mastercard points",
      "Complimentary lounge access"],
    welcomeOffer: "10,000 Bonus Points",
    special_remarks: "High-income users"

  },

  {
    name: "ICICI Amazon Pay Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    ratings: { shopping: 10, travel: 4, charges: 9, fuel: 5, dining_entertainment: 6, rewards: 9 },
    benefits: [
      "5% Amazon cashback",
      "2% Amazon Pay rewards",
      "1% universal cashback"
    ],
    welcomeOffer: "₹500 Instant Cashback",
    special_remarks: "Amazon shoppers",
    min_income: 0,
    eligibility: { min_age: 18, max_age: 70, credit_score_min: 700, employment_type: ["Salaried", "Self-employed", "Student"] }
  },
  {
    name: "ICICI HPCL Credit Card",
    annual_charges: "₹199 + GST",
    ratings: { shopping: 5, travel: 4, charges: 8, fuel: 9, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "4% HPCL surcharge waiver",
      "2.5% other fuel discounts",
      "Movie ticket offers"
    ],
    welcomeOffer: "₹300 Fuel Cashback",
    special_remarks: "Fuel users",
    min_income: 240000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 650, employment_type: ["Salaried"] }
  },
  {
    name: "Amex Platinum Card",
    annual_charges: "₹60,000 + GST",
    ratings: { shopping: 8, travel: 10, charges: 4, fuel: 6, dining_entertainment: 9, rewards: 9 },
    benefits: [
      "Taj Epicure membership",
      "Unlimited lounge access",
      "Luxury travel offers"
    ],
    welcomeOffer: "50,000 Membership Points",
    special_remarks: "Luxury seekers",
    min_income: 6000000,
    eligibility: { min_age: 18, max_age: 75, credit_score_min: 800, employment_type: ["Salaried", "Professional"] }
  },
  {
    name: "Amex Platinum Reserve Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "2x Membership Rewards",
      "Golf benefits",
      "Lounge access"
    ],
    welcomeOffer: "25,000 Welcome Points",
    special_remarks: "Premium lifestyle"
  },
  {
    name: "Amex Membership Rewards Credit Card",
    annual_charges: "₹4,500 + GST",
    ratings: { shopping: 7, travel: 8, charges: 6, fuel: 5, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "1 point per ₹50 spent",
      "Dining discounts",
      "Travel offers"
    ],
    welcomeOffer: "15,000 Bonus Points",
    special_remarks: "Reward collectors"
  },
  {
    name: "Amex SmartEarn Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 7, travel: 6, charges: 7, fuel: 6, dining_entertainment: 8, rewards: 7 },
    benefits: [
      "2x groceries/fuel rewards",
      "BookMyShow discounts",
      "Yatra travel offers"
    ],
    welcomeOffer: "₹500 Cashback",
    special_remarks: "Budget users"
  },
  {
    name: "Amex Gold Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 7, travel: 8, charges: 6, fuel: 5, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "1 point per ₹50 spent",
      "Complimentary lounge access",
      "Dining privileges"
    ],
    welcomeOffer: "10,000 Welcome Points",
    special_remarks: "Frequent travelers"
  },
  {
    name: "IDFC FIRST Millennia Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 5, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5x online rewards",
      "Flipkart/Amazon offers",
      "Fuel surcharge waiver"
    ],
    welcomeOffer: "₹1000 Shopping Voucher",
    special_remarks: "Online shoppers"
  },
  {
    name: "IDFC FIRST Classic Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 7, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2x all spends points",
      "Complimentary lounge access",
      "Fuel waiver"
    ],
    welcomeOffer: "500 Welcome Points",
    special_remarks: "Entry-level users"
  },
  {
    name: "IDFC FIRST Select Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 6, travel: 8, charges: 6, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x dining/travel points",
      "Lounge access",
      "Entertainment discounts"
    ],
    welcomeOffer: "2000 Bonus Points",
    special_remarks: "Frequent travelers"
  },
  {
    name: "IDFC FIRST Wealth Credit Card",
    annual_charges: "₹3,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 9 },
    benefits: [
      "5x all spends rewards",
      "Concierge service",
      "Unlimited lounge access"
    ],
    welcomeOffer: "15,000 Welcome Points",
    special_remarks: "High-net-worth individuals"
  },
  {
    name: "IDFC FIRST Business Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 6, travel: 7, charges: 6, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2x transaction points",
      "Fuel surcharge waiver",
      "Dining offers"
    ],
    welcomeOffer: "1000 Business Points",
    special_remarks: "Business users"
  },
  {
    name: "PNB Global Gold Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 5, travel: 7, charges: 6, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2 reward points/₹100",
      "Dining discounts",
      "Travel offers"
    ],
    welcomeOffer: "500 Welcome Points",
    special_remarks: "Frequent travelers"
  },
  {
    name: "PNB Global Platinum Credit Card",
    annual_charges: "₹2,000 + GST",
    ratings: { shopping: 6, travel: 8, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x reward points",
      "Complimentary lounge access",
      "Travel insurance"
    ],
    welcomeOffer: "2000 Bonus Points",
    special_remarks: "Premium users"
  },
  {
    name: "PNB Rupay Platinum Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 5, travel: 6, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2 reward points/₹100",
      "Fuel surcharge waiver",
      "Entertainment offers"
    ],
    welcomeOffer: "₹500 Cashback",
    special_remarks: "Rupay users"
  },
  {
    name: "PNB Wave N Pay Contactless Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 5, travel: 6, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "Contactless rewards",
      "Dining discounts",
      "Fuel waiver"
    ],
    welcomeOffer: "3x Reward Points",
    special_remarks: "Contactless users"
  },
  {
    name: "Standard Chartered Platinum Rewards Credit Card",
    annual_charges: "₹2,500 + GST",
    ratings: { shopping: 8, travel: 8, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "5x online rewards",
      "Lounge access",
      "Entertainment discounts"
    ],
    welcomeOffer: "10,000 Bonus Points",
    special_remarks: "Premium users"
  },
  {
    name: "Standard Chartered Manhattan Platinum Credit Card",
    annual_charges: "₹1,500 + GST",
    ratings: { shopping: 9, travel: 5, charges: 6, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5% grocery cashback",
      "Departmental store offers",
      "1% general cashback"
    ],
    welcomeOffer: "₹1000 Shopping Voucher",
    special_remarks: "Grocery shoppers"
  },
  {
    name: "Standard Chartered Super Value Titanium Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 7, travel: 5, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2x all spends rewards",
      "Fuel surcharge waiver",
      "Entertainment discounts"
    ],
    welcomeOffer: "2x Reward Points for first 3 months",
    special_remarks: "Budget-conscious users"
  },
  {
    name: "Standard Chartered DigiSmart Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 5, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5x online shopping points",
      "Fuel surcharge waiver",
      "Entertainment offers"
    ],
    welcomeOffer: "₹1000 Cashback",
    special_remarks: "Digital shoppers"
  },
  {
    name: "Standard Chartered Ultimate Credit Card",
    annual_charges: "₹5,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 9 },
    benefits: [
      "4x all spends rewards",
      "Unlimited lounge access",
      "Concierge services"
    ],
    welcomeOffer: "15,000 Bonus Points",
    special_remarks: "High-net-worth individuals"
  },
  {
    name: "Standard Chartered Emirates World Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 6, travel: 10, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 9 },
    benefits: [
      "5x travel/dining rewards",
      "Unlimited lounge access",
      "Exclusive travel benefits"
    ],
    welcomeOffer: "20,000 Travel Points",
    special_remarks: "Frequent flyers"
  },
  {
    name: "Axis Bank ACE Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 8, travel: 5, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5% utility bill cashback",
      "4% Ola/Swiggy rewards",
      "2% general cashback"
    ],
    welcomeOffer: "₹250 Instant Cashback",
    special_remarks: "Bill payers",
    min_income: 360000,
    eligibility: { min_age: 21, max_age: 60, credit_score_min: 720, employment_type: ["Salaried", "Self-employed"] }
  },
  {
    name: "Axis Bank Magnus Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 7, travel: 10, charges: 5, fuel: 6, dining_entertainment: 9, rewards: 9 },
    benefits: [
      "12x travel/dining points",
      "Unlimited lounge access",
      "Concierge services"
    ],
    welcomeOffer: "25,000 Welcome Points",
    special_remarks: "Premium lifestyle",
    min_income: 2400000,
    eligibility: { min_age: 21, max_age: 65, credit_score_min: 780, employment_type: ["Salaried", "Professional"] }
  },
  {
    name: "Axis Bank My Zone Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 5, charges: 7, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: [
      "5x entertainment rewards",
      "BookMyShow offers",
      "Fuel surcharge waiver"
    ],
    welcomeOffer: "2 Free Movie Tickets",
    special_remarks: "Entertainment lovers"
  },
  {
    name: "Axis Bank Vistara Credit Card",
    annual_charges: "₹3,000 + GST",
    ratings: { shopping: 6, travel: 10, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 9 },
    benefits: [
      "Vistara Club membership",
      "Unlimited lounge access",
      "Flight discounts"
    ],
    welcomeOffer: "Free Flight Voucher",
    special_remarks: "Frequent flyers"
  },
  {
    name: "Axis Bank Buzz Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 5, charges: 7, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: [
      "5x dining/entertainment points",
      "BookMyShow discounts",
      "Fuel waiver"
    ],
    welcomeOffer: "₹500 Dining Credit",
    special_remarks: "Young users"
  },
  {
    name: "Axis Bank FreeCharge Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 8, travel: 5, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5% FreeCharge cashback",
      "1% general cashback",
      "Dining offers"
    ],
    welcomeOffer: "₹300 Cashback",
    special_remarks: "FreeCharge users"
  },
  {
    name: "Flipkart Axis Bank Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 9, travel: 5, charges: 7, fuel: 5, dining_entertainment: 7, rewards: 8 },
    benefits: [
      "5% Flipkart cashback",
      "1.5% other spends",
      "Entertainment discounts"
    ],
    welcomeOffer: "₹500 Flipkart Voucher",
    special_remarks: "Flipkart shoppers"
  },
  {
    name: "Citi Rewards Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 9, travel: 6, charges: 6, fuel: 5, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "10x departmental store points",
      "5x movie rewards",
      "Travel discounts"
    ],
    welcomeOffer: "5,000 Bonus Points",
    special_remarks: "Shoppers & movie lovers"
  },
  {
    name: "Citi Cash Back Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 7, travel: 5, charges: 6, fuel: 5, dining_entertainment: 8, rewards: 7 },
    benefits: [
      "5% dining/grocery cashback",
      "1% general cashback",
      "Entertainment offers"
    ],
    welcomeOffer: "₹500 Cashback",
    special_remarks: "Frequent diners"
  },
  {
    name: "Citi PremierMiles Credit Card",
    annual_charges: "₹3,000 + GST",
    ratings: { shopping: 6, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x travel/dining points",
      "Unlimited lounge access",
      "Hotel discounts"
    ],
    welcomeOffer: "10,000 Travel Points",
    special_remarks: "Frequent travelers"
  },
  {
    name: "Citi IndianOil Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 5, travel: 5, charges: 7, fuel: 9, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "4% IndianOil surcharge waiver",
      "2.5% other fuel discounts",
      "Movie offers"
    ],
    welcomeOffer: "₹400 Fuel Cashback",
    special_remarks: "Fuel users"
  },
  {
    name: "Citi Prestige Credit Card",
    annual_charges: "₹10,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 9 },
    benefits: [
      "5x all spends rewards",
      "Concierge service",
      "Unlimited lounge access"
    ],
    welcomeOffer: "30,000 Welcome Points",
    special_remarks: "High-net-worth individuals"
  },
  {
    name: "Kotak 811 #DreamDifferent Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    ratings: { shopping: 6, travel: 5, charges: 8, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2x all spends points",
      "Fuel surcharge waiver",
      "No annual fees"
    ],
    welcomeOffer: "Lifetime Free Card",
    special_remarks: "Budget users"
  },
  {
    name: "Kotak PVR Platinum Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 5, charges: 7, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: [
      "5x PVR rewards",
      "Fuel surcharge waiver",
      "Dining discounts"
    ],
    welcomeOffer: "2 Movie Tickets",
    special_remarks: "Movie buffs"
  },
  {
    name: "Kotak Royale Signature Credit Card",
    annual_charges: "₹3,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x all spends points",
      "Unlimited lounge access",
      "Concierge services"
    ],
    welcomeOffer: "12,000 Welcome Points",
    special_remarks: "Premium users"
  },
  {
    name: "Kotak Delight Platinum Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 6, travel: 5, charges: 6, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: [
      "5x dining/entertainment points",
      "BookMyShow offers",
      "Fuel waiver"
    ],
    welcomeOffer: "₹1000 Dining Credit",
    special_remarks: "Frequent diners"
  },
  {
    name: "Kotak Essentia Platinum Credit Card",
    annual_charges: "₹2,000 + GST",
    ratings: { shopping: 7, travel: 9, charges: 5, fuel: 6, dining_entertainment: 8, rewards: 8 },
    benefits: [
      "4x all spends rewards",
      "Unlimited lounge access",
      "Concierge services"
    ],
    welcomeOffer: "10,000 Bonus Points",
    special_remarks: "High-net-worth individuals"
  },
  {
    name: "Kotak Zen Signature Credit Card",
    annual_charges: "₹1,000 + GST",
    ratings: { shopping: 6, travel: 5, charges: 6, fuel: 5, dining_entertainment: 9, rewards: 7 },
    benefits: [
      "5x entertainment rewards",
      "Fuel surcharge waiver",
      "Dining discounts"
    ],
    welcomeOffer: "2 Movie Tickets",
    special_remarks: "Young users"
  },
  {
    name: "Yes Bank Prosperity Rewards Plus Credit Card",
    annual_charges: "₹500 + GST",
    ratings: { shopping: 6, travel: 5, charges: 7, fuel: 6, dining_entertainment: 7, rewards: 7 },
    benefits: [
      "2x all spends points",
      "Fuel surcharge waiver",
      "Entertainment offers"
    ],
    welcomeOffer: "500 Welcome Points",
    special_remarks: "Entry-level users"
  }
];

module.exports = creditCards;