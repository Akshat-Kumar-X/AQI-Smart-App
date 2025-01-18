// EU AQI Calculator (European Union)
// Reference : https://airindex.eea.europa.eu/AQI/index.html#

module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 20, color: 'Light Blue' },
        { name: 'Fair', min: 21, max: 40, color: 'Green' },
        { name: 'Moderate', min: 41, max: 60, color: 'Yellow' },
        { name: 'Poor', min: 61, max: 80, color: 'Orange' },
        { name: 'Very Poor', min: 81, max: 100, color: 'Red' },
        { name: 'Extremely Poor', min: 81, max: 100, color: 'Purple' }
    ];

    const pollutants = [
        { name: 'PM2.5', BP_LO: [0, 10, 20, 25, 50, 75], BP_HI: [10, 20, 25, 50, 75, 800], I_LO: [0, 20, 40, 60, 80], I_HI: [20, 40, 60, 80, 100] },
        { name: 'PM10', BP_LO: [0, 20, 40, 50, 100, 150], BP_HI: [20, 40, 50, 100, 150, 1200], I_LO: [0, 20, 40, 60, 80], I_HI: [20, 40, 60, 80, 100] },
        { name: 'NO2', BP_LO: [0, 40, 90, 120, 230, 340], BP_HI: [40, 90, 120, 230, 340, 1000], I_LO: [0, 20, 40, 60, 80], I_HI: [20, 40, 60, 80, 100] },
        { name: 'O3', BP_LO: [0, 50, 100, 130, 240, 380], BP_HI: [50, 100, 130, 240, 380, 800], I_LO: [0, 20, 40, 60, 80], I_HI: [20, 40, 60, 80, 100] },
        { name: 'SO2', BP_LO: [0, 100, 200, 350, 500, 750], BP_HI: [100, 200, 350, 500, 750, 1250], I_LO: [0, 20, 40, 60, 80], I_HI: [20, 40, 60, 80, 100] }
    ];


    let highestAQI = 0;
    let responsiblePollutant = '';

    pollutants.forEach(pollutant => {
        const value = parseFloat(pollutantValues[pollutant.name]);

        if (value !== undefined && !isNaN(value)) {
            for (let i = 0; i < pollutant.BP_LO.length; i++) {
                if (value >= pollutant.BP_LO[i] && value <= pollutant.BP_HI[i]) {
                    const I_P = ((pollutant.I_HI[i] - pollutant.I_LO[i]) /
                        (pollutant.BP_HI[i] - pollutant.BP_LO[i])) *
                        (value - pollutant.BP_LO[i]) + pollutant.I_LO[i];

                    if (I_P > highestAQI) {
                        highestAQI = I_P;
                        responsiblePollutant = pollutant.name;
                    }
                    break;
                }
            }

            if (value > pollutant.BP_HI[pollutant.BP_HI.length - 1]) {
                highestAQI = pollutant.I_HI[pollutant.I_HI.length - 1];
                responsiblePollutant = pollutant.name;
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
