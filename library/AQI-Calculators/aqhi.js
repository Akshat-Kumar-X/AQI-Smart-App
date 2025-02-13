// Source: https://www.canada.ca/en/environment-climate-change/services/air-quality-health-index/about.html#calculated
// Source: https://www.alberta.ca/air-quality-health-index-calculation
// Source: https://www.publichealthontario.ca/-/media/documents/A/2013/air-quality-health-index.pdf

// AQHI Calculator for Canada

module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Low', min: 1, max: 3, color: 'Blue' },
        { name: 'Moderate', min: 4, max: 6, color: 'Yellow' },
        { name: 'High', min: 7, max: 10, color: 'Orange' },
        { name: 'Very High', min: 11, max: Infinity, color: 'Red' }
    ];

    // Risk coefficients for AQHI formula
    const riskCoefficients = {
        O3: 0.000537, // Ozone (ppb)
        PM2_5: 0.000487, // PM2.5 (µg/m³)
        NO2: 0.000871  // Nitrogen Dioxide (ppb)
    };

    // Ensure pollutant names match the SmartThings API format
    const O3 = parseFloat(pollutantValues.O3) || 0;
    const PM2_5 = parseFloat(pollutantValues["PM2.5"]) || 0; // ✅ Fixed PM2.5 name
    const NO2 = parseFloat(pollutantValues.NO2) || 0;

    // Validate input values
    if ([O3, PM2_5, NO2].some(value => value === undefined || isNaN(value))) {
        return {
            AQHI: null,
            category: 'Invalid Input',
            color: 'Unknown',
            responsiblePollutant: 'N/A'
        };
    }

    // Calculate the AQHI using risk coefficients
    const riskO3 = riskCoefficients.O3 * O3;
    const riskPM2_5 = riskCoefficients.PM2_5 * PM2_5;
    const riskNO2 = riskCoefficients.NO2 * NO2;

    const totalRisk = riskO3 + riskPM2_5 + riskNO2;
    const AQHI = Math.round(10 * totalRisk);

    // Determine AQHI category
    const category = categories.find(c => AQHI >= c.min && (c.max === Infinity || AQHI <= c.max));

    // Identify the dominant pollutant responsible for the highest risk
    const risks = { O3: riskO3, "PM2.5": riskPM2_5, NO2: riskNO2 };
    const responsiblePollutant = Object.keys(risks).reduce((a, b) => risks[a] > risks[b] ? a : b);

    return {
        AQHI: AQHI,
        category: category ? category.name : 'Unknown',
        color: category ? category.color : 'Unknown',
        responsiblePollutant
    };
};
