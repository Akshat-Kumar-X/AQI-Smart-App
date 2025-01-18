const CAI_Calculator = require('./AQI-Calculators/cai');
const EPA_Calculator = require('./AQI-Calculators/epa');
const NAQI_Calculator = require('./AQI-Calculators/naqi');

const FEA_Calculator = require('./AQI-Calculators/fea');
const AQHI_Calculator = require('./AQI-Calculators/aqhi');
const DAQI_Calculator =  require('./AQI-Calculators/daqi')
const EEA_Calculator=require('./AQI-Calculators/eea')
// Add more calculators as you expand to more standards

const calculators = {
    cai: CAI_Calculator,
    epa: EPA_Calculator,
    naqi: NAQI_Calculator,
    fea: FEA_Calculator,
    aqhi: AQHI_Calculator,
    daqi: DAQI_Calculator,
    eea: EEA_Calculator
};

module.exports = (standardType = 'cai') => {
    const selectedCalculator = calculators[standardType.toLowerCase()];

    if (!selectedCalculator) {
        throw new Error(`Invalid AQI standard type: '${standardType}'. Supported types are: ${Object.keys(calculators).join(', ')}`);
    }

    return selectedCalculator;
};

