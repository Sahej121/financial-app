/**
 * HSN/SAC Code Seed Data
 * Common GST codes for Indian businesses
 */

const hsnCodes = [
    // Chapter 1 - Live Animals
    { code: '0101', description: 'Live horses, asses, mules and hinnies', type: 'HSN', gstRate: 0, chapter: '01', category: 'Live Animals' },
    { code: '0102', description: 'Live bovine animals', type: 'HSN', gstRate: 0, chapter: '01', category: 'Live Animals' },
    { code: '0104', description: 'Live sheep and goats', type: 'HSN', gstRate: 0, chapter: '01', category: 'Live Animals' },

    // Chapter 2 - Meat
    { code: '0201', description: 'Meat of bovine animals, fresh or chilled', type: 'HSN', gstRate: 0, chapter: '02', category: 'Meat', isCommon: true },
    { code: '0207', description: 'Meat and edible offal of poultry', type: 'HSN', gstRate: 0, chapter: '02', category: 'Meat', isCommon: true },

    // Chapter 7 - Vegetables
    { code: '0701', description: 'Potatoes, fresh or chilled', type: 'HSN', gstRate: 0, chapter: '07', category: 'Vegetables', isCommon: true },
    { code: '0702', description: 'Tomatoes, fresh or chilled', type: 'HSN', gstRate: 0, chapter: '07', category: 'Vegetables', isCommon: true },
    { code: '0703', description: 'Onions, shallots, garlic, leeks', type: 'HSN', gstRate: 0, chapter: '07', category: 'Vegetables', isCommon: true },

    // Chapter 10 - Cereals
    { code: '1001', description: 'Wheat and meslin', type: 'HSN', gstRate: 0, chapter: '10', category: 'Cereals', isCommon: true },
    { code: '1006', description: 'Rice', type: 'HSN', gstRate: 5, chapter: '10', category: 'Cereals', isCommon: true },

    // Chapter 15 - Fats and Oils
    { code: '1501', description: 'Pig fat and poultry fat', type: 'HSN', gstRate: 12, chapter: '15', category: 'Fats and Oils' },
    { code: '1507', description: 'Soya-bean oil', type: 'HSN', gstRate: 5, chapter: '15', category: 'Fats and Oils', isCommon: true },
    { code: '1512', description: 'Sunflower-seed or safflower oil', type: 'HSN', gstRate: 5, chapter: '15', category: 'Fats and Oils', isCommon: true },

    // Chapter 17 - Sugars
    { code: '1701', description: 'Cane or beet sugar', type: 'HSN', gstRate: 5, chapter: '17', category: 'Sugars', isCommon: true },

    // Chapter 19 - Bakery Products
    { code: '1905', description: 'Bread, pastry, cakes, biscuits', type: 'HSN', gstRate: 18, chapter: '19', category: 'Bakery Products', isCommon: true },

    // Chapter 22 - Beverages
    { code: '2201', description: 'Mineral waters and aerated waters', type: 'HSN', gstRate: 18, chapter: '22', category: 'Beverages', isCommon: true },
    { code: '2202', description: 'Other non-alcoholic beverages', type: 'HSN', gstRate: 28, cessRate: 12, chapter: '22', category: 'Beverages', isCommon: true },

    // Chapter 27 - Mineral Fuels
    { code: '2710', description: 'Petroleum oils and oils obtained from bituminous minerals', type: 'HSN', gstRate: 18, chapter: '27', category: 'Mineral Fuels', isCommon: true },

    // Chapter 30 - Pharmaceutical Products
    { code: '3001', description: 'Glands and other organs for organotherapy', type: 'HSN', gstRate: 12, chapter: '30', category: 'Pharmaceuticals' },
    { code: '3003', description: 'Medicaments (not in measured doses)', type: 'HSN', gstRate: 12, chapter: '30', category: 'Pharmaceuticals', isCommon: true },
    { code: '3004', description: 'Medicaments (in measured doses)', type: 'HSN', gstRate: 12, chapter: '30', category: 'Pharmaceuticals', isCommon: true },

    // Chapter 39 - Plastics
    { code: '3901', description: 'Polymers of ethylene, in primary forms', type: 'HSN', gstRate: 18, chapter: '39', category: 'Plastics', isCommon: true },
    { code: '3923', description: 'Plastic articles for conveyance or packing', type: 'HSN', gstRate: 18, chapter: '39', category: 'Plastics', isCommon: true },

    // Chapter 48 - Paper
    { code: '4801', description: 'Newsprint, in rolls or sheets', type: 'HSN', gstRate: 5, chapter: '48', category: 'Paper', isCommon: true },
    { code: '4802', description: 'Uncoated paper and paperboard', type: 'HSN', gstRate: 12, chapter: '48', category: 'Paper', isCommon: true },
    { code: '4819', description: 'Cartons, boxes, cases, bags of paper', type: 'HSN', gstRate: 18, chapter: '48', category: 'Paper', isCommon: true },

    // Chapter 52 - Cotton
    { code: '5201', description: 'Cotton, not carded or combed', type: 'HSN', gstRate: 5, chapter: '52', category: 'Cotton', isCommon: true },
    { code: '5208', description: 'Woven fabrics of cotton', type: 'HSN', gstRate: 5, chapter: '52', category: 'Cotton', isCommon: true },

    // Chapter 61 - Apparel, Knitted
    { code: '6101', description: 'Men\'s or boys\' overcoats, knitted', type: 'HSN', gstRate: 12, chapter: '61', category: 'Apparel', isCommon: true },
    { code: '6109', description: 'T-shirts, singlets, knitted', type: 'HSN', gstRate: 12, chapter: '61', category: 'Apparel', isCommon: true },

    // Chapter 64 - Footwear
    { code: '6401', description: 'Waterproof footwear with rubber/plastic', type: 'HSN', gstRate: 18, chapter: '64', category: 'Footwear', isCommon: true },
    { code: '6402', description: 'Other footwear with rubber/plastic soles', type: 'HSN', gstRate: 18, chapter: '64', category: 'Footwear', isCommon: true },
    { code: '6403', description: 'Footwear with leather uppers', type: 'HSN', gstRate: 18, chapter: '64', category: 'Footwear', isCommon: true },

    // Chapter 72 - Iron and Steel
    { code: '7201', description: 'Pig iron and spiegeleisen', type: 'HSN', gstRate: 18, chapter: '72', category: 'Iron and Steel', isCommon: true },
    { code: '7210', description: 'Flat-rolled iron or steel, coated', type: 'HSN', gstRate: 18, chapter: '72', category: 'Iron and Steel', isCommon: true },

    // Chapter 84 - Machinery
    { code: '8414', description: 'Air or vacuum pumps, air compressors', type: 'HSN', gstRate: 18, chapter: '84', category: 'Machinery', isCommon: true },
    { code: '8415', description: 'Air conditioning machines', type: 'HSN', gstRate: 28, chapter: '84', category: 'Machinery', isCommon: true },
    { code: '8418', description: 'Refrigerators, freezers', type: 'HSN', gstRate: 18, chapter: '84', category: 'Machinery', isCommon: true },
    { code: '8443', description: 'Printing machinery; printers, copiers', type: 'HSN', gstRate: 18, chapter: '84', category: 'Machinery', isCommon: true },
    { code: '8471', description: 'Automatic data processing machines (computers)', type: 'HSN', gstRate: 18, chapter: '84', category: 'Machinery', isCommon: true },

    // Chapter 85 - Electrical Machinery
    { code: '8501', description: 'Electric motors and generators', type: 'HSN', gstRate: 18, chapter: '85', category: 'Electrical', isCommon: true },
    { code: '8504', description: 'Electrical transformers', type: 'HSN', gstRate: 18, chapter: '85', category: 'Electrical', isCommon: true },
    { code: '8507', description: 'Electric accumulators (batteries)', type: 'HSN', gstRate: 28, chapter: '85', category: 'Electrical', isCommon: true },
    { code: '8517', description: 'Telephone sets, smartphones', type: 'HSN', gstRate: 18, chapter: '85', category: 'Electrical', isCommon: true },
    { code: '8528', description: 'Television receivers, monitors', type: 'HSN', gstRate: 18, chapter: '85', category: 'Electrical', isCommon: true },

    // Chapter 87 - Vehicles
    { code: '8703', description: 'Motor cars and vehicles for transport', type: 'HSN', gstRate: 28, cessRate: 15, chapter: '87', category: 'Vehicles', isCommon: true },
    { code: '8711', description: 'Motorcycles and cycles with auxiliary motor', type: 'HSN', gstRate: 28, chapter: '87', category: 'Vehicles', isCommon: true },

    // Chapter 94 - Furniture
    { code: '9401', description: 'Seats (excl. medical/dental furniture)', type: 'HSN', gstRate: 18, chapter: '94', category: 'Furniture', isCommon: true },
    { code: '9403', description: 'Other furniture and parts thereof', type: 'HSN', gstRate: 18, chapter: '94', category: 'Furniture', isCommon: true },

    // SAC Codes - Services
    { code: '9954', description: 'Construction services', type: 'SAC', gstRate: 18, category: 'Construction', isCommon: true },
    { code: '9961', description: 'Financial and related services', type: 'SAC', gstRate: 18, category: 'Financial Services', isCommon: true },
    { code: '9962', description: 'Real estate services', type: 'SAC', gstRate: 18, category: 'Real Estate', isCommon: true },
    { code: '9963', description: 'Rental/leasing services without operators', type: 'SAC', gstRate: 18, category: 'Rental Services', isCommon: true },
    { code: '9964', description: 'Passenger transport services', type: 'SAC', gstRate: 5, category: 'Transport', isCommon: true },
    { code: '9965', description: 'Goods transport services', type: 'SAC', gstRate: 5, category: 'Transport', isCommon: true },
    { code: '9966', description: 'Supporting and auxiliary transport services', type: 'SAC', gstRate: 18, category: 'Transport', isCommon: true },
    { code: '9967', description: 'Postal and courier services', type: 'SAC', gstRate: 18, category: 'Postal', isCommon: true },
    { code: '9971', description: 'Banking and other financial services', type: 'SAC', gstRate: 18, category: 'Banking', isCommon: true },
    { code: '9972', description: 'Insurance and pension services', type: 'SAC', gstRate: 18, category: 'Insurance', isCommon: true },
    { code: '9973', description: 'Leasing or rental services with operator', type: 'SAC', gstRate: 18, category: 'Rental Services', isCommon: true },
    { code: '9981', description: 'Research and development services', type: 'SAC', gstRate: 18, category: 'R&D', isCommon: true },
    { code: '9982', description: 'Legal and accounting services', type: 'SAC', gstRate: 18, category: 'Professional Services', isCommon: true },
    { code: '9983', description: 'Other professional, technical services', type: 'SAC', gstRate: 18, category: 'Professional Services', isCommon: true },
    { code: '9984', description: 'Telecommunications, broadcasting services', type: 'SAC', gstRate: 18, category: 'Telecom', isCommon: true },
    { code: '9985', description: 'Support services', type: 'SAC', gstRate: 18, category: 'Support Services', isCommon: true },
    { code: '9987', description: 'Maintenance and repair services', type: 'SAC', gstRate: 18, category: 'Maintenance', isCommon: true },
    { code: '9988', description: 'Manufacturing services on physical inputs', type: 'SAC', gstRate: 18, category: 'Manufacturing', isCommon: true },
    { code: '9991', description: 'Public administration services', type: 'SAC', gstRate: 0, category: 'Government', isCommon: false },
    { code: '9992', description: 'Education services', type: 'SAC', gstRate: 0, category: 'Education', isCommon: true },
    { code: '9993', description: 'Human health and social care services', type: 'SAC', gstRate: 0, category: 'Healthcare', isCommon: true },
    { code: '9995', description: 'Recreational, cultural and sporting services', type: 'SAC', gstRate: 18, category: 'Entertainment', isCommon: true },
    { code: '9996', description: 'Personal services', type: 'SAC', gstRate: 18, category: 'Personal Services', isCommon: true },
    { code: '9997', description: 'Other services', type: 'SAC', gstRate: 18, category: 'Other', isCommon: true },

    // More common goods
    { code: '4901', description: 'Printed books, brochures, leaflets', type: 'HSN', gstRate: 0, chapter: '49', category: 'Books', isCommon: true },
    { code: '4902', description: 'Newspapers, journals and periodicals', type: 'HSN', gstRate: 0, chapter: '49', category: 'Books', isCommon: true },
    { code: '3304', description: 'Beauty or make-up preparations', type: 'HSN', gstRate: 28, chapter: '33', category: 'Cosmetics', isCommon: true },
    { code: '3305', description: 'Preparations for use on the hair', type: 'HSN', gstRate: 18, chapter: '33', category: 'Cosmetics', isCommon: true },
    { code: '3401', description: 'Soap; organic surface-active products', type: 'HSN', gstRate: 18, chapter: '34', category: 'Soap', isCommon: true },
    { code: '3402', description: 'Organic surface-active agents, detergents', type: 'HSN', gstRate: 18, chapter: '34', category: 'Detergents', isCommon: true },
    { code: '7013', description: 'Glassware for table, kitchen, toilet', type: 'HSN', gstRate: 18, chapter: '70', category: 'Glassware', isCommon: true },
    { code: '7308', description: 'Structures of iron or steel', type: 'HSN', gstRate: 18, chapter: '73', category: 'Iron and Steel', isCommon: true },
    { code: '7318', description: 'Screws, bolts, nuts, washers of iron or steel', type: 'HSN', gstRate: 18, chapter: '73', category: 'Iron and Steel', isCommon: true },
    { code: '7615', description: 'Table, kitchen articles of aluminium', type: 'HSN', gstRate: 18, chapter: '76', category: 'Aluminium', isCommon: true },
    { code: '9503', description: 'Toys and games', type: 'HSN', gstRate: 18, chapter: '95', category: 'Toys', isCommon: true },
    { code: '9619', description: 'Sanitary towels, diapers, napkins', type: 'HSN', gstRate: 12, chapter: '96', category: 'Sanitary', isCommon: true },
];

module.exports = { hsnCodes };
