
// CAI calculator for South Korea

module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 50, color: 'Blue' },
        { name: 'Moderate', min: 51, max: 100, color: 'Green' },
        { name: 'Unhealthy', min: 101, max: 250, color: 'Yellow' },
        { name: 'Very Unhealthy', min: 251, max: 500, color: 'Red' }
    ];

    const pollutants = [
        { name: 'SO2', BP_LO: [0, 0.02, 0.051, 0.151], BP_HI: [0.02, 0.05, 0.15, 1], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] },
        { name: 'CO', BP_LO: [0, 2, 9, 15], BP_HI: [2, 9, 15, 50], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] },
        { name: 'O3', BP_LO: [0, 0.03, 0.091, 0.151], BP_HI: [0.03, 0.09, 0.15, 0.6], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] },
        { name: 'NO2', BP_LO: [0, 0.03, 0.061, 0.201], BP_HI: [0.03, 0.06, 0.2, 2], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] },
        { name: 'PM10', BP_LO: [0, 31, 81, 151], BP_HI: [30, 80, 150, 600], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] },
        { name: 'PM2.5', BP_LO: [0, 16, 36, 76], BP_HI: [15, 35, 75, 500], I_LO: [0, 51, 101, 251], I_HI: [50, 100, 250, 500] }
    ];

    let highestAQI = 0;
    let responsiblePollutant = '';

    pollutants.forEach(pollutant => {
        const value = parseFloat(pollutantValues[pollutant.name]);

        if (value !== undefined && !isNaN(value)) {
            for (let i = 0; i < pollutant.BP_LO.length; i++) {
                if (value >= pollutant.BP_LO[i] && value <= pollutant.BP_HI[i]) {
                    const I_P = ((pollutant.I_HI[i] - pollutant.I_LO[i]) / (pollutant.BP_HI[i] - pollutant.BP_LO[i])) * (value - pollutant.BP_LO[i]) + pollutant.I_LO[i];

                    if (I_P > highestAQI) {
                        highestAQI = I_P;
                        responsiblePollutant = pollutant.name;
                    }
                    break;
                }
            }
        }
    });

    const category = categories.find(c => highestAQI >= c.min && highestAQI <= c.max);

    return {
        AQI: Math.round(highestAQI),
        category: category ? category.name : 'Unknown',
        color: category ? category.color : 'Unknown',
        responsiblePollutant
    };
};
