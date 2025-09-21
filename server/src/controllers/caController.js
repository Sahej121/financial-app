const { CA } = require('../models');
const { Op } = require('sequelize');

exports.getCAs = async (req, res) => {
  try {
    const { experience, minPrice, maxPrice, specialization, sortBy } = req.query;
    
    let whereClause = { isActive: true };
    
    if (experience && experience !== 'all') {
      const [min, max] = experience.split('-');
      whereClause.experience = {
        [Op.between]: [parseInt(min), max === '+' ? 100 : parseInt(max)]
      };
    }
    
    if (minPrice && maxPrice) {
      whereClause.consultationFee = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
      };
    }

    if (specialization && specialization !== 'all') {
      whereClause.specializations = {
        [Op.like]: `%${specialization}%`
      };
    }

    let orderClause = [['rating', 'DESC']]; // Default sort

    if (sortBy) {
      switch (sortBy) {
        case 'experience':
          orderClause = [['experience', 'DESC']];
          break;
        case 'fee-low':
          orderClause = [['consultationFee', 'ASC']];
          break;
        case 'fee-high':
          orderClause = [['consultationFee', 'DESC']];
          break;
        case 'rating':
          orderClause = [['rating', 'DESC']];
          break;
        case 'name':
          orderClause = [['name', 'ASC']];
          break;
        default:
          orderClause = [['rating', 'DESC']];
      }
    }
    
    const cas = await CA.findAll({
      where: whereClause,
      order: orderClause
    });
    
    res.json(cas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCA = async (req, res) => {
  try {
    const caData = req.body;
    const ca = await CA.create(caData);
    res.status(201).json(ca);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 