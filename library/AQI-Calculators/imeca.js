// IMECA AQI Calculator (Mexico)
// Reference: https://es.wikipedia.org/wiki/%C3%8Dndice_metropolitano_de_la_calidad_del_aire
module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 50, color: 'Green' },
        { name: 'Regular', min: 51, max: 100, color: 'Yellow' },
        { name: 'Bad', min: 101, max: 150, color: 'Orange' },
        { name: 'Very Bad', min: 151, max: 200, color: 'Red' },
        { name: 'Extremely Bad', min: 201, max: 300, color: 'Purple' }
    ];

    const pollutants = [
        { name: 'PM10', BP_LO: [0, 61, 121, 221, 321], BP_HI: [60, 120, 220, 320, 420], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] },
        { name: 'PM2.5', BP_LO: [0, 15.5, 40.5, 65.5, 90.5], BP_HI: [15.4, 40.4, 65.4, 90.4, 115.4], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] },
        { name: 'O3', BP_LO: [0, 0.056, 0.096, 0.136, 0.176], BP_HI: [0.055, 0.095, 0.135, 0.175, 0.220], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] },
        { name: 'NO2', BP_LO: [0, 0.111, 0.211, 0.311, 0.411], BP_HI: [0.110, 0.210, 0.310, 0.410, 0.510], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] },
        { name: 'SO2', BP_LO: [0, 0.136, 0.186, 0.236, 0.286], BP_HI: [0.135, 0.185, 0.235, 0.285, 0.335], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] },
        { name: 'CO', BP_LO: [0, 5.6, 11.6, 17.6, 23.6], BP_HI: [5.5, 11.5, 17.5, 23.5, 29.5], I_LO: [0, 51, 101, 151, 201], I_HI: [50, 100, 150, 200, 300] }
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
