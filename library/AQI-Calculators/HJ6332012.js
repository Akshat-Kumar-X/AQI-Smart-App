module.exports = (pollutantValues) => {
    const categories = [
        { name: 'Good', min: 0, max: 50, color: 'Green' },
        { name: 'Moderate', min: 51, max: 100, color: 'Yellow' },
        { name: 'Unhealthy for Sensitive Groups', min: 101, max: 150, color: 'Orange' },
        { name: 'Unhealthy', min: 151, max: 200, color: 'Red' },
        { name: 'Very Unhealthy', min: 201, max: 300, color: 'Purple' },
        { name: 'Hazardous', min: 301, max: 500, color: 'Maroon' }
    ];

    const pollutants = [
        {
            name: 'PM2.5',
            BP_LO: [0, 35, 75, 115, 150, 250, 350],
            BP_HI: [34, 74, 114, 149, 249, 349, 500],
            I_LO: [0, 51, 101, 151, 201, 301, 401],
            I_HI: [50, 100, 150, 200, 300, 400, 500]
        },
        {
            name: 'PM10',
            BP_LO: [0, 50, 150, 250, 350, 420, 500],
            BP_HI: [49, 149, 249, 349, 419, 499, 600],
            I_LO: [0, 51, 101, 151, 201, 301, 401],
            I_HI: [50, 100, 150, 200, 300, 400, 500]
        },
        {
            name: 'SO2',
            BP_LO: [0, 150, 500, 650, 800],
            BP_HI: [149, 499, 649, 799, 1000],
            I_LO: [0, 51, 101, 201, 301],
            I_HI: [50, 100, 200, 300, 400]
        },
        {
            name: 'NO2',
            BP_LO: [0, 40, 80, 180, 280, 400],
            BP_HI: [39, 79, 179, 279, 399, 500],
            I_LO: [0, 51, 101, 201, 301, 401],
            I_HI: [50, 100, 200, 300, 400, 500]
        },
        {
            name: 'CO',
            BP_LO: [0, 2, 4, 14, 24],
            BP_HI: [1.9, 3.9, 13.9, 23.9, 35],
            I_LO: [0, 51, 101, 201, 301],
            I_HI: [50, 100, 200, 300, 400]
        },
        {
            name: 'O3',
            BP_LO: [0, 100, 160, 215, 265, 800],
            BP_HI: [99, 159, 214, 264, 799, 1000],
            I_LO: [0, 51, 101, 151, 201, 301],
            I_HI: [50, 100, 150, 200, 300, 500]
        }
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