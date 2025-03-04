const { Pool } = require('pg');
const creditCards = require('./creditCardData');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedCreditCards() {
  try {
    // First, clear existing data
    await pool.query('TRUNCATE credit_cards RESTART IDENTITY CASCADE');

    // Insert new data
    for (const card of creditCards) {
      await pool.query(
        `INSERT INTO credit_cards (
          name, 
          annual_charges, 
          hidden_charges, 
          key_benefits, 
          special_remarks
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          card.name,
          card.annual_charges,
          card.hidden_charges,
          card.key_benefits,
          card.special_remarks
        ]
      );
    }

    console.log('Credit cards seeded successfully');
  } catch (error) {
    console.error('Error seeding credit cards:', error);
  } finally {
    await pool.end();
  }
}

seedCreditCards(); 