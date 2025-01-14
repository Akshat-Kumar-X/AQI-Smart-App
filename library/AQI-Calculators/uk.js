// AQI calculator for the UK
module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Low', min: 1, max: 3, color: 'Green' },
        { name: 'Moderate', min: 4, max: 6, color: 'Yellow' },
        { name: 'High', min: 7, max: 9, color: 'Red' },
        { name: 'Very High', min: 10, max: 10, color: 'Purple' }
    ];

    const pollutants = [
        { name: 'SO2', BP_LO: [0, 267, 533, 1065], BP_HI: [266, 532, 1064, 1200], I_LO: [1, 4, 7, 10], I_HI: [3, 6, 9, 10] },
        { name: 'O3', BP_LO: [0, 101, 161, 241], BP_HI: [100, 160, 240, 350], I_LO: [1, 4, 7, 10], I_HI: [3, 6, 9, 10] },
        { name: 'NO2', BP_LO: [0, 201, 401, 601], BP_HI: [200, 400, 600, 800], I_LO: [1, 4, 7, 10], I_HI: [3, 6, 9, 10] },
        { name: 'PM10', BP_LO: [0, 51, 76, 101], BP_HI: [50, 75, 100, 150], I_LO: [1, 4, 7, 10], I_HI: [3, 6, 9, 10] },
        { name: 'PM2.5', BP_LO: [0, 36, 54, 71], BP_HI: [35, 53, 70, 100], I_LO: [1, 4, 7, 10], I_HI: [3, 6, 9, 10] }
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
