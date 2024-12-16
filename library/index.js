const CAI_Calculator = require('./AQI-Calculators/cai');

// Add more calculators as you expand to more standards
const calculators = {
    cai: CAI_Calculator,
};

module.exports = (standardType = 'cai') => {
    // Default to CAI if no specific standard is found
    return calculators[standardType.toLowerCase()] || calculators['cai'];
};
