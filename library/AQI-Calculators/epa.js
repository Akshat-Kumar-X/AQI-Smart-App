// EPA AQI calculator for PM2.5 (United States)

module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 50, color: 'Green' },
        { name: 'Moderate', min: 51, max: 100, color: 'Yellow' },
        { name: 'USG', min: 101, max: 150, color: 'Orange' },
        { name: 'Unhealthy', min: 151, max: 200, color: 'Red' },
        { name: 'Very Unhealthy', min: 201, max: 300, color: 'Purple' },
        { name: 'Hazardous', min: 301, max: 500, color: 'Maroon' }
    ];

    const pollutants = [
        { name: 'PM2.5', BP_LO: [0, 55, 155, 255, 355, 425], BP_HI: [54, 154, 254, 354, 424, 604], I_LO: [0, 51, 101, 151, 201, 301], I_HI: [50, 100, 150, 200, 300, 500] }
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

            // Handle values exceeding the highest range
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
