//Reference: https://helpcenter.netatmo.com/hc/en-us/articles/360022762151-Air-Quality-Index-AQI
//Reference: https://aqicn.org/city/france/

// France AQI calculator 
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
            BP_LO: [0.0, 12.1, 35.5, 55.5, 150.5, 250.5],
            BP_HI: [12.0, 35.4, 55.4, 150.4, 250.4, 500.0],
            I_LO:  [0, 51, 101, 151, 201, 301],
            I_HI:  [50, 100, 150, 200, 300, 500]
        },
        {
            name: 'PM10',
            BP_LO: [0, 55, 155, 255, 355, 425],
            BP_HI: [54, 154, 254, 354, 424, 604],
            I_LO:  [0, 51, 101, 151, 201, 301],
            I_HI:  [50, 100, 150, 200, 300, 500]
        },
        {
            name: 'NO2',
            BP_LO: [0, 54, 101, 361, 650, 1250],
            BP_HI: [53, 100, 360, 649, 1249, 2049],
            I_LO:  [0, 51, 101, 151, 201, 301],
            I_HI:  [50, 100, 150, 200, 300, 500]
        },
        {
            name: 'O3',
            BP_LO: [0, 55, 71, 86, 106, 201],
            BP_HI: [54, 70, 85, 105, 200, 604],
            I_LO:  [0, 51, 101, 151, 201, 301],
            I_HI:  [50, 100, 150, 200, 300, 500]
        },
        {
            name: 'SO2',
            BP_LO: [0, 36, 76, 186, 305, 605],
            BP_HI: [35, 75, 185, 304, 604, 1004],
            I_LO:  [0, 51, 101, 151, 201, 301],
            I_HI:  [50, 100, 150, 200, 300, 500]
        }
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