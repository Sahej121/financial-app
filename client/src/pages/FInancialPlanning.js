import React, { useState } from "react";

const FInancialPlanning = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    loanType: "",
    amount: "",
    tenure: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/submit-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(`Reference Number: ${data.referenceNumber}. A representative will contact you shortly.`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <select name="loanType" onChange={handleChange} required>
        <option value="">Select Loan Type</option>
        <option value="credit_card">Credit Card Loan</option>
        <option value="personal_loan">Personal Loan</option>
      </select>
      <input type="number" name="amount" placeholder="Loan Amount" onChange={handleChange} required />
      <input type="number" name="tenure" placeholder="Loan Tenure (months)" onChange={handleChange} required />
      <input type="text" name="Lending Company" placeholder="Lender" onChange={handleChange} required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default FInancialPlanning;
