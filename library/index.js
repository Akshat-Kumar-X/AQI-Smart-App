const CAI_Calculator = require('./AQI-Calculators/cai');
const EPA_Calculator = require('./AQI-Calculators/epa');
const NAQI_Calculator = require('./AQI-Calculators/naqi');

const UBA_Calculator = require('./AQI-Calculators/uba');
const AQHI_Calculator = require('./AQI-Calculators/aqhi');
const DAQI_Calculator =  require('./AQI-Calculators/daqi')
const EEA_Calculator = require('./AQI-Calculators/eea')
const IMECA_Calculator = require('./AQI-Calculators/imeca')
const CAQI_Calculator = require('./AQI-Calculators/caqi')
const HJ6332012_Calculator = require('./AQI-Calculators/HJ6332012')
// Add more calculators as you expand to more standards

const calculators = {
    cai: CAI_Calculator,
    epa: EPA_Calculator,
    naqi: NAQI_Calculator,
    uba: UBA_Calculator,
    aqhi: AQHI_Calculator,
    daqi: DAQI_Calculator,
    eea: EEA_Calculator,
    imeca: IMECA_Calculator,
    caqi: CAQI_Calculator,
    HJ6332012: HJ6332012_Calculator,
};

module.exports = (standardType = 'cai') => {
    const selectedCalculator = calculators[standardType.toLowerCase()];

    if (!selectedCalculator) {
        throw new Error(`Invalid AQI standard type: '${standardType}'. Supported types are: ${Object.keys(calculators).join(', ')}`);
    }

    return selectedCalculator;
};

