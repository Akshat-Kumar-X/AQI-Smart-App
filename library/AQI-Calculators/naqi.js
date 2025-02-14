module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 50, color: 'Green' },
        { name: 'Satisfactory', min: 51, max: 100, color: 'Light Green' },
        { name: 'Moderate', min: 101, max: 200, color: 'Yellow' },
        { name: 'Poor', min: 201, max: 300, color: 'Orange' },
        { name: 'Very Poor', min: 301, max: 400, color: 'Red' },
        { name: 'Severe', min: 401, max: 500, color: 'Maroon' }
    ];

    const pollutants = [
        {
            name: 'PM2.5',
            BP_LO: [0, 31, 61, 91, 121, 251],
            BP_HI: [30, 60, 90, 120, 250, 500],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'PM10',
            BP_LO: [0, 51, 101, 251, 351, 431],
            BP_HI: [50, 100, 250, 350, 430, 500],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'SO2',
            BP_LO: [0, 41, 81, 381, 801, 1601],
            BP_HI: [40, 80, 380, 800, 1600, 2000],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'NO2',
            BP_LO: [0, 41, 81, 181, 281, 401],
            BP_HI: [40, 80, 180, 280, 400, 500],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'CO',
            BP_LO: [0, 1.1, 2.1, 10.1, 17.1, 34.1],
            BP_HI: [1, 2, 10, 17, 34, 50],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'O3',
            BP_LO: [0, 51, 101, 169, 209, 749],
            BP_HI: [50, 100, 168, 208, 748, 1000],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'NH3',
            BP_LO: [0, 201, 401, 801, 1201, 1801],
            BP_HI: [200, 400, 800, 1200, 1800, 2400],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
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
