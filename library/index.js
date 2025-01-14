const CAI_Calculator = require('./AQI-Calculators/cai');
const EPA_Calculator = require('./AQI-Calculators/epa');
const NAQI_Calculator = require('./AQI-Calculators/naqi');
const UK_Calculator = require('./AQI-Calculators/uk')
// Add more calculators as you expand to more standards

const calculators = {
    cai: CAI_Calculator,
    epa: EPA_Calculator,
    naqi: NAQI_Calculator,
    uk: UK_Calculator
};

module.exports = (standardType = 'cai') => {
    const selectedCalculator = calculators[standardType.toLowerCase()];

    if (!selectedCalculator) {
        throw new Error(`Invalid AQI standard type: '${standardType}'. Supported types are: ${Object.keys(calculators).join(', ')}`);
    }

    return selectedCalculator;
};

