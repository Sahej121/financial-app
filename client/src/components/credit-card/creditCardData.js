const creditCards = [
  {
    name: "HDFC Bank Millennia Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5% cashback on Amazon, Flipkart, and other online platforms; 1% cashback on all other spends",
    special_remarks: "Best for online shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 7,
      fuel: 4,
      dining_entertainment: 6,
      rewards: 8
    }
  },
  {
    name: "HDFC Bank Regalia Credit Card",
    annual_charges: "₹2,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "4 reward points per ₹150 spent; complimentary airport lounge access; discounts on dining and travel",
    special_remarks: "Ideal for frequent travelers.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 6,
      fuel: 5,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "HDFC Bank Diners Club Black Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5x reward points on dining and travel; unlimited airport lounge access; exclusive golf benefits",
    special_remarks: "Best for high-net-worth individuals.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 4,
      dining_entertainment: 9,
      rewards: 9
    }
  },
  {
    name: "HDFC Bank Infinia Credit Card",
    annual_charges: "₹12,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 8,
      travel: 10,
      charges: 5,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 10
    }
  },
  {
    name: "HDFC Bank MoneyBack Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "2x reward points on online spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 4,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "HDFC Bank Platinum Times Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for movie buffs.",
    ratings: {
      shopping: 6,
      travel: 4,
      charges: 8,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "HDFC Bank Titanium Times Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Best for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 4,
      charges: 7,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "HDFC Bank Tata Neu Infinity Credit Card",
    annual_charges: "₹1,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5% NeuCoins on Tata Neu app; 1.5% NeuCoins on other spends; discounts on Tata brands",
    special_remarks: "Ideal for Tata brand users.",
    ratings: {
      shopping: 8,
      travel: 5,
      charges: 6,
      fuel: 4,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "HDFC Bank Paytm First Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5% cashback on Paytm spends; 1% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Best for Paytm users.",
    ratings: {
      shopping: 9,
      travel: 4,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "HDFC Bank Flipkart Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹500)",
    key_benefits: "5% cashback on Flipkart; 1.5% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Ideal for Flipkart shoppers.",
    ratings: {
      shopping: 9,
      travel: 4,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "SBI SimplySAVE Credit Card",
    annual_charges: "₹499 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining, groceries, and movies; 1% fuel surcharge waiver",
    special_remarks: "Best for everyday spends.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 7
    }
  },
  {
    name: "SBI SimplyClick Credit Card",
    annual_charges: "₹499 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on online spends; 1% fuel surcharge waiver; discounts on Amazon and BookMyShow",
    special_remarks: "Ideal for online shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 8,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "SBI Elite Credit Card",
    annual_charges: "₹4,999 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Best for frequent travelers.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "SBI Card PRIME",
    annual_charges: "₹2,999 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "SBI IRCTC Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on IRCTC spends; 1% fuel surcharge waiver; discounts on dining and travel",
    special_remarks: "Best for train travelers.",
    ratings: {
      shopping: 5,
      travel: 8,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "SBI Yatra Credit Card",
    annual_charges: "₹1,499 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on Yatra spends; 1% fuel surcharge waiver; discounts on dining and travel",
    special_remarks: "Ideal for frequent travelers.",
    ratings: {
      shopping: 6,
      travel: 9,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Paytm SBI Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on Paytm spends; 1% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Best for Paytm users.",
    ratings: {
      shopping: 9,
      travel: 4,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "SBI Aurum Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 9
    }
  },
  {
    name: "ICICI Coral Credit Card",
    annual_charges: "₹499 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2 PayBack points per ₹100 spent; complimentary railway lounge access; discounts on Cleartrip and Yatra",
    special_remarks: "Best for frequent travelers.",
    ratings: {
      shopping: 6,
      travel: 8,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "ICICI Rubyx Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4 PayBack points per ₹100 on Amex; 2 PayBack points per ₹100 on Visa; complimentary airport lounge access",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "ICICI Sapphiro Credit Card",
    annual_charges: "₹6,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4 PayBack points per ₹100 on Amex; 2 PayBack points per ₹100 on Mastercard; complimentary airport lounge access",
    special_remarks: "Best for high-income individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "ICICI Amazon Pay Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on Amazon.in; 2% cashback on Amazon Pay; 1% cashback on other spends",
    special_remarks: "Ideal for Amazon shoppers.",
    ratings: {
      shopping: 10,
      travel: 4,
      charges: 9,
      fuel: 5,
      dining_entertainment: 6,
      rewards: 9
    }
  },
  {
    name: "ICICI HPCL Credit Card",
    annual_charges: "₹199 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4% surcharge waiver at HPCL pumps; 2.5% fuel surcharge waiver at other fuel stations; discounts on dining and movies",
    special_remarks: "Best for fuel users.",
    ratings: {
      shopping: 5,
      travel: 4,
      charges: 8,
      fuel: 9,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Amex Platinum Card",
    annual_charges: "₹60,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,500; Cash withdrawal fee: 3.5% of the amount (min ₹500)",
    key_benefits: "Complimentary Taj Epicure membership; unlimited airport lounge access; exclusive dining and travel offers",
    special_remarks: "Ideal for luxury seekers.",
    ratings: {
      shopping: 8,
      travel: 10,
      charges: 4,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 9
    }
  },
  {
    name: "Amex Platinum Reserve Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,500; Cash withdrawal fee: 3.5% of the amount (min ₹500)",
    key_benefits: "2 Membership Rewards points per ₹100 spent; complimentary airport lounge access; golf benefits",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Amex Membership Rewards Credit Card",
    annual_charges: "₹4,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,500; Cash withdrawal fee: 3.5% of the amount (min ₹500)",
    key_benefits: "1 Membership Rewards point per ₹50 spent; discounts on dining, travel, and entertainment",
    special_remarks: "Ideal for reward seekers.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 5,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Amex SmartEarn Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,500; Cash withdrawal fee: 3.5% of the amount (min ₹500)",
    key_benefits: "2 Membership Rewards points per ₹100 spent on groceries, fuel, and dining; discounts on BookMyShow and Yatra",
    special_remarks: "Best for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 6,
      charges: 7,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 7
    }
  },
  {
    name: "Amex Gold Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,500; Cash withdrawal fee: 3.5% of the amount (min ₹500)",
    key_benefits: "1 Membership Rewards point per ₹50 spent; complimentary airport lounge access; discounts on dining and entertainment",
    special_remarks: "Ideal for frequent travelers.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 5,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "IDFC FIRST Millennia Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on online spends; 1% fuel surcharge waiver; discounts on Flipkart and Amazon",
    special_remarks: "Best for online shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "IDFC FIRST Classic Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; complimentary airport lounge access",
    special_remarks: "Ideal for entry-level users.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "IDFC FIRST Select Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on dining and travel; complimentary airport lounge access; discounts on dining and entertainment",
    special_remarks: "Best for frequent travelers.",
    ratings: {
      shopping: 6,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "IDFC FIRST Wealth Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "IDFC FIRST Business Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for business users.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "PNB Global Gold Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2 reward points per ₹100 spent; fuel surcharge waiver; discounts on dining and travel",
    special_remarks: "Ideal for frequent travelers.",
    ratings: {
      shopping: 5,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "PNB Global Platinum Credit Card",
    annual_charges: "₹2,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4 reward points per ₹100 spent; complimentary airport lounge access; discounts on dining and travel",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 6,
      travel: 8,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "PNB Rupay Platinum Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2 reward points per ₹100 spent; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for entry-level users.",
    ratings: {
      shopping: 5,
      travel: 6,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "PNB Wave N Pay Contactless Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2 reward points per ₹100 spent; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for contactless payment users.",
    ratings: {
      shopping: 5,
      travel: 6,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Standard Chartered Platinum Rewards Credit Card",
    annual_charges: "₹2,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5x reward points on online spends; complimentary airport lounge access; discounts on dining and entertainment",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 8,
      travel: 8,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Standard Chartered Manhattan Platinum Credit Card",
    annual_charges: "₹1,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5% cashback on groceries and departmental stores; 1% cashback on other spends",
    special_remarks: "Best for grocery shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 6,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Standard Chartered Super Value Titanium Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Standard Chartered DigiSmart Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5x reward points on online spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for online shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Standard Chartered Ultimate Credit Card",
    annual_charges: "₹5,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Standard Chartered Emirates World Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5x reward points on travel and dining; unlimited airport lounge access; exclusive travel benefits",
    special_remarks: "Best for frequent flyers.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Axis Bank ACE Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on bill payments and utilities; 4% cashback on Ola and Swiggy; 2% cashback on other spends",
    special_remarks: "Ideal for utility bill payments.",
    ratings: {
      shopping: 8,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Axis Bank Magnus Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "12x reward points on travel and dining; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 7,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 9
    }
  },
  {
    name: "Axis Bank My Zone Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for movie buffs.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Axis Bank Vistara Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "Complimentary Vistara Club membership; unlimited airport lounge access; discounts on Vistara flights",
    special_remarks: "Best for frequent flyers.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Axis Bank Buzz Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for young users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Axis Bank FreeCharge Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on FreeCharge spends; 1% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Best for FreeCharge users.",
    ratings: {
      shopping: 8,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Flipkart Axis Bank Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on Flipkart; 1.5% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Ideal for Flipkart shoppers.",
    ratings: {
      shopping: 9,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Citi Rewards Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "10x reward points on departmental stores; 5x reward points on movies; discounts on dining and travel",
    special_remarks: "Best for shoppers and movie buffs.",
    ratings: {
      shopping: 9,
      travel: 6,
      charges: 6,
      fuel: 5,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Citi Cash Back Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5% cashback on dining and groceries; 1% cashback on other spends",
    special_remarks: "Ideal for frequent diners.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 6,
      fuel: 5,
      dining_entertainment: 8,
      rewards: 7
    }
  },
  {
    name: "Citi PremierMiles Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4x reward points on travel and dining; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Best for frequent travelers.",
    ratings: {
      shopping: 6,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Citi IndianOil Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4% surcharge waiver at IndianOil pumps; 2.5% fuel surcharge waiver at other fuel stations; discounts on dining and movies",
    special_remarks: "Ideal for fuel users.",
    ratings: {
      shopping: 5,
      travel: 5,
      charges: 7,
      fuel: 9,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Citi Prestige Credit Card",
    annual_charges: "₹10,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Best for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Kotak 811 #DreamDifferent Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for budget-conscious users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Kotak PVR Platinum Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on PVR spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for movie buffs.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Kotak Royale Signature Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Kotak Delight Platinum Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Best for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 6,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Kotak Essentia Platinum Credit Card",
    annual_charges: "₹2,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Kotak Zen Signature Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Best for young users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 6,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Yes Bank Prosperity Rewards Plus Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for entry-level users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Yes Bank Prosperity Edge Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Best for frequent travelers.",
    ratings: {
      shopping: 6,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Yes Bank First Preferred Credit Card",
    annual_charges: "₹1,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 8
    }
  },
  {
    name: "Yes Bank First Exclusive Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Best for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "RBL Bank Shoprite Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on grocery spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for grocery shoppers.",
    ratings: {
      shopping: 8,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "RBL Bank Platinum Maxima Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "RBL Bank Icon Credit Card",
    annual_charges: "₹2,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 8
    }
  },
  {
    name: "RBL Bank Popcorn Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on PVR spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for movie buffs.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 5,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Bajaj Finserv RBL SuperCard",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "IndusInd Bank Legend Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4x reward points on dining and travel; unlimited airport lounge access; discounts on dining and entertainment",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "IndusInd Bank Platinum Aura Edge Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 8
    }
  },
  {
    name: "IndusInd Bank Pinnacle Credit Card",
    annual_charges: "₹5,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "5x reward points on all spends; unlimited airport lounge access; exclusive concierge services",
    special_remarks: "Ideal for high-net-worth individuals.",
    ratings: {
      shopping: 7,
      travel: 9,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "IndusInd Bank Iconia Credit Card",
    annual_charges: "₹2,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "IndusInd Bank Vistara Signature Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "Complimentary Vistara Club membership; unlimited airport lounge access; discounts on Vistara flights",
    special_remarks: "Best for frequent flyers.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Bank of Baroda Eterna Credit Card",
    annual_charges: "₹2,500 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Ideal for premium users.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Bank of Baroda Prime Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Best for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 8
    }
  },
  {
    name: "Bank of Baroda ICAI Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for ICAI members.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Union Bank Signature Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for entry-level users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Union Bank Platinum Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 7
    }
  },
  {
    name: "Union Bank Classic Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for budget-conscious users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Union Bank Rupay Select Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "2x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for Rupay users.",
    ratings: {
      shopping: 6,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Federal Bank Celesta Credit Card",
    annual_charges: "₹2,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "4x reward points on all spends; unlimited airport lounge access; discounts on dining and travel",
    special_remarks: "Best for premium users.",
    ratings: {
      shopping: 7,
      travel: 8,
      charges: 6,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 8
    }
  },
  {
    name: "Federal Bank Imperio Credit Card",
    annual_charges: "₹1,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹900; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on dining and entertainment; 1% fuel surcharge waiver; discounts on BookMyShow",
    special_remarks: "Ideal for frequent diners.",
    ratings: {
      shopping: 6,
      travel: 7,
      charges: 6,
      fuel: 6,
      dining_entertainment: 9,
      rewards: 8
    }
  },
  {
    name: "OneCard Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for tech-savvy users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Slice Super Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for young users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "ZestMoney Virtual Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for online shoppers.",
    ratings: {
      shopping: 8,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "LazyCard by LazyPay",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Uni Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for young users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Navi Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on all spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for budget-conscious users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 8,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "IRCTC SBI Platinum Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on IRCTC spends; 1% fuel surcharge waiver; discounts on dining and travel",
    special_remarks: "Best for train travelers.",
    ratings: {
      shopping: 5,
      travel: 8,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "IndusInd Bank Vistara Signature Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "Complimentary Vistara Club membership; unlimited airport lounge access; discounts on Vistara flights",
    special_remarks: "Ideal for frequent flyers.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "RBL Bank Ola Money Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on Ola spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Best for Ola users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Axis Bank Vistara Credit Card",
    annual_charges: "₹3,000 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "Complimentary Vistara Club membership; unlimited airport lounge access; discounts on Vistara flights",
    special_remarks: "Ideal for frequent flyers.",
    ratings: {
      shopping: 6,
      travel: 10,
      charges: 5,
      fuel: 6,
      dining_entertainment: 8,
      rewards: 9
    }
  },
  {
    name: "Citi IndianOil Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 3% of the amount (min ₹500)",
    key_benefits: "4% surcharge waiver at IndianOil pumps; 2.5% fuel surcharge waiver at other fuel stations; discounts on dining and movies",
    special_remarks: "Best for fuel users.",
    ratings: {
      shopping: 5,
      travel: 5,
      charges: 7,
      fuel: 9,
      dining_entertainment: 7,
      rewards: 7
    }
  },
  {
    name: "Amazon Pay ICICI Credit Card",
    annual_charges: "₹0 (Lifetime free)",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on Amazon.in; 2% cashback on Amazon Pay; 1% cashback on other spends",
    special_remarks: "Ideal for Amazon shoppers.",
    ratings: {
      shopping: 10,
      travel: 4,
      charges: 9,
      fuel: 5,
      dining_entertainment: 6,
      rewards: 9
    }
  },
  {
    name: "Paytm HDFC Bank Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹1,000; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5% cashback on Paytm spends; 1% cashback on other spends; discounts on dining and entertainment",
    special_remarks: "Best for Paytm users.",
    ratings: {
      shopping: 9,
      travel: 4,
      charges: 7,
      fuel: 5,
      dining_entertainment: 7,
      rewards: 8
    }
  },
  {
    name: "Ola Money SBI Credit Card",
    annual_charges: "₹500 + GST",
    hidden_charges: "Late payment fee: Up to ₹600; Cash withdrawal fee: 2.5% of the amount (min ₹300)",
    key_benefits: "5x reward points on Ola spends; 1% fuel surcharge waiver; discounts on dining and entertainment",
    special_remarks: "Ideal for Ola users.",
    ratings: {
      shopping: 7,
      travel: 5,
      charges: 7,
      fuel: 6,
      dining_entertainment: 7,
      rewards: 7
    }
  }
];

module.exports = creditCards;