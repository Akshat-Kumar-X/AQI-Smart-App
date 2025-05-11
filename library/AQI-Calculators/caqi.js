module.exports = (pollutantValues) => {
    // CAQI categories as defined by the CAQI project:
    //   • 0–25: Very Low (Green)
    //   • 26–50: Low (Yellow)
    //   • 51–75: Medium (Orange)
    //   • 76–100: High (Red)
    //   • >100: Very High (Purple)
    const categories = [
        { name: 'Very Low', min: 0, max: 25, color: 'Green' },
        { name: 'Low', min: 26, max: 50, color: 'Yellow' },
        { name: 'Medium', min: 51, max: 75, color: 'Orange' },
        { name: 'High', min: 76, max: 100, color: 'Red' },
        { name: 'Very High', min: 101, max: Infinity, color: 'Purple' }
    ];

    // Breakpoints for each pollutant.
    // Note: These are sample values based on CAQI documentation and literature.
    // Adjust the breakpoint arrays as needed to match your local/regional definitions.
    const pollutants = [
        {
            name: 'PM10',
            // Concentration ranges in µg/m³ for PM10:
            // 0–20  => sub-index 0–25, 21–40 => 26–50, 41–50 => 51–75, 51–100 => 76–100, >100 => >100
            BP_LO: [0, 21, 41, 51, 101],
            BP_HI: [20, 40, 50, 100, 500],
            I_LO: [0, 26, 51, 76, 101],
            I_HI: [25, 50, 75, 100, 500]
        },
        {
            name: 'PM2.5',
            // Concentration ranges in µg/m³ for PM2.5:
            // 0–10  => sub-index 0–25, 11–20 => 26–50, 21–25 => 51–75, 26–50 => 76–100, >50 => >100
            BP_LO: [0, 11, 21, 26, 51],
            BP_HI: [10, 20, 25, 50, 250],
            I_LO: [0, 26, 51, 76, 101],
            I_HI: [25, 50, 75, 100, 500]
        },
        {
            name: 'O3',
            // Concentration ranges in µg/m³ for O3:
            // 0–40  => sub-index 0–25, 41–80 => 26–50, 81–100 => 51–75, 101–140 => 76–100, >140 => >100
            BP_LO: [0, 41, 81, 101, 141],
            BP_HI: [40, 80, 100, 140, 240],
            I_LO: [0, 26, 51, 76, 101],
            I_HI: [25, 50, 75, 100, 500]
        },
        {
            name: 'NO2',
            // Concentration ranges in µg/m³ for NO2:
            // 0–25  => sub-index 0–25, 26–50 => 26–50, 51–100 => 51–75, 101–200 => 76–100, >200 => >100
            BP_LO: [0, 26, 51, 101, 201],
            BP_HI: [25, 50, 100, 200, 400],
            I_LO: [0, 26, 51, 76, 101],
            I_HI: [25, 50, 75, 100, 500]
        }
    ];

    let highestCAQI = 0;
    let responsiblePollutant = '';

    // Compute a sub-index for each pollutant and keep track of the highest one.
    pollutants.forEach(pollutant => {
        const value = parseFloat(pollutantValues[pollutant.name]);
        if (value !== undefined && !isNaN(value)) {
            for (let i = 0; i < pollutant.BP_LO.length; i++) {
                if (value >= pollutant.BP_LO[i] && value <= pollutant.BP_HI[i]) {
                    // Linear interpolation for sub-index:
                    const subIndex = ((pollutant.I_HI[i] - pollutant.I_LO[i]) / (pollutant.BP_HI[i] - pollutant.BP_LO[i]))
                        * (value - pollutant.BP_LO[i]) + pollutant.I_LO[i];
                    if (subIndex > highestCAQI) {
                        highestCAQI = subIndex;
                        responsiblePollutant = pollutant.name;
                    }
                    break;
                }
            }
        }
    });

    // Determine the overall CAQI category
    const category = categories.find(c => highestCAQI >= c.min && highestCAQI <= c.max);

    return {
        CAQI: Math.round(highestCAQI),
        category: category ? category.name : 'Unknown',
        color: category ? category.color : 'Unknown',
        responsiblePollutant
    };
};