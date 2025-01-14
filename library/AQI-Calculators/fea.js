// AQI calculator for Germany

//sources:- https://www.umweltbundesamt.de/en/calculation-base-air-quality-index

module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Very Good', min: 0, max: 20, color: 'Blue' },
        { name: 'Good', min: 21, max: 40, color: 'Green' },
        { name: 'Moderate', min: 41, max: 100, color: 'Yellow' },
        { name: 'Poor', min: 101, max: 200, color: 'Orange' },
        { name: 'Very Poor', min: 201, max: Infinity, color: 'Red' }
    ];

    const pollutants = [
        { name: 'NO2', BP_LO: [0, 21, 41, 101, 201], BP_HI: [20, 40, 100, 200, Infinity], I_LO: [0, 21, 41, 101, 201], I_HI: [20, 40, 100, 200, Infinity] },
        { name: 'PM10', BP_LO: [0, 21, 36, 51, 101], BP_HI: [20, 35, 50, 100, Infinity], I_LO: [0, 21, 41, 101, 201], I_HI: [20, 35, 50, 100, Infinity] },
        { name: 'PM2.5', BP_LO: [0, 11, 21, 26, 51], BP_HI: [10, 20, 25, 50, Infinity], I_LO: [0, 21, 41, 101, 201], I_HI: [10, 20, 25, 50, Infinity] },
        { name: 'O3', BP_LO: [0, 61, 121, 181, 241], BP_HI: [60, 120, 180, 240, Infinity], I_LO: [0, 21, 41, 101, 201], I_HI: [60, 120, 180, 240, Infinity] }
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
