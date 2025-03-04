const { CA } = require('../models');
const { Op } = require('sequelize');

exports.getCAs = async (req, res) => {
  try {
    const { experience, minPrice, maxPrice } = req.query;
    
    let whereClause = {};
    
    if (experience && experience !== 'all') {
      const [min, max] = experience.split('-');
      whereClause.experience = {
        [Op.between]: [parseInt(min), max === '+' ? 100 : parseInt(max)]
      };
    }
    
    if (minPrice && maxPrice) {
      whereClause.fee = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
      };
    }
    
    const cas = await CA.findAll({
      where: whereClause,
      order: [['rating', 'DESC']]
    });
    
    res.json(cas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 