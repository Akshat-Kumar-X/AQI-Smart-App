const { SmartApp } = require('@smartthings/smartapp');
const getAQICalculator = require('../library');

const smartApp = new SmartApp()
    .enableEventLogging()
    .page('mainPage', (context, page, configData) => {
        page.name('Air Quality Input');
        page.nextPageId('resultPage');
        page.complete(false);

        // ✅ Section 1: Gaseous Pollutants
        page.section('Gaseous Pollutants', section => {
            section.paragraphSetting('gaseousHeading')
                .name('💨 Enter Gas Concentrations')
                .description('Provide the concentration levels of gaseous pollutants (ppm).');

            section.numberSetting('SO2')
                .min(0).max(1)
                .required(false)
                .name('Sulfur Dioxide (SO2, ppm)');

            section.numberSetting('CO')
                .min(0).max(50)
                .required(false)
                .name('Carbon Monoxide (CO, ppm)');

            section.numberSetting('O3')
                .min(0).max(0.6)
                .required(false)
                .name('Ozone (O3, ppm)');

            section.numberSetting('NO2')
                .min(0).max(2)
                .required(false)
                .name('Nitrogen Dioxide (NO2, ppm)');
        });

        // ✅ Section 2: Particulate Matter
        page.section('Particulate Matter (PM)', section => {
            section.paragraphSetting('pmHeading')
                .name('🌫️ Enter PM Levels')
                .description('Provide the levels of particulate matter (µg/m³).');

            section.numberSetting('PM10')
                .min(0).max(600)
                .required(false)
                .name('PM10 (µg/m³)');

            section.numberSetting('PM2.5')
                .min(0).max(500)
                .required(false)
                .name('PM2.5 (µg/m³)');
        });

        // ✅ Section 3: AQI Standard Selection
        page.section('AQI Standard Selection', section => {
            section.enumSetting('standardType')
                .options([
                    { id: 'cai', name: '🇰🇷 CAI (South Korea)' },
                    { id: 'epa', name: '🇺🇸 EPA (USA)' },
                    { id: 'naqi', name: '🇮🇳 NAQI (India)' },
                    { id: 'fea', name: '🇩🇪 FEA (Germany)' },
                    { id: 'aqhi', name: '🇨🇦 AQHI (Canada)' }
                ])
                .required(true)
                .name('☑️ Select AQI Calculation Standard')
                .description('Choose a standard for AQI calculation based on your location.');
        });
    })

    .page('resultPage', (context, page) => {
        const settings = context.config;
    
        // Extract pollutant values
        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.stringConfig?.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.stringConfig?.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.stringConfig?.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.stringConfig?.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.stringConfig?.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.stringConfig?.value || 0),
        };
    
        const standardType = settings.standardType?.[0]?.stringConfig?.value || 'cai';
    
        // Get the appropriate AQI calculator
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);
    
        // AQI Color Mapping
        const colorMapping = {
            "Green": "🟩",
            "Light Green": "🟩",
            "Yellow": "🟨",
            "Orange": "🟧",
            "Red": "🟥",
            "Maroon": "🟥"
        };
    
        const colorEmoji = colorMapping[result.color] || "⬜"; // Default white if unknown
    
        page.name('AQI Result');
        page.complete(true);
    
        // ✅ AQI Result Section
        page.section('Calculated AQI', section => {
            section.paragraphSetting('aqiValue')
                .name('📈 AQI Calculation Result')
                .description(
                    `AQI Result: ${result.AQI}\n` +
                    `AQI Category: ${colorEmoji} ${result.category} \n` +
                    `Pollutant: ${result.responsiblePollutant}\n` +
                    `Color: ${result.color}`
                    `Current Standard: ${standardType.toUpperCase()}`
                );
        });
    })
    
    // ✅ Lifecycle: Handle Updates
    .updated(async (context, updateData) => {
        const settings = context.config;

        // Extract pollutant inputs
        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.stringConfig?.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.stringConfig?.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.stringConfig?.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.stringConfig?.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.stringConfig?.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.stringConfig?.value || 0),
        };

        const standardType = settings.standardType?.[0]?.stringConfig?.value || 'cai';

        // Get the AQI calculator
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);

        // Log AQI result
        console.log(`AQI Result: ${JSON.stringify(result)}`);

        // Send notification
        await context.api.notifications.send({
            message: `AQI: ${result.AQI}\nCategory: ${result.category}\nResponsible Pollutant: ${result.responsiblePollutant}`,
            type: 'ALERT'
        });

        console.log('Notification sent to user.');
    });

module.exports = async (req, res) => {
    try {
        const { lifecycle, confirmationData } = req.body;

        if (lifecycle === 'CONFIRMATION') {
            console.log('CONFIRMATION request received:', confirmationData.confirmationUrl);
            await fetch(confirmationData.confirmationUrl);
            res.status(200).send('Confirmation successful');
            return;
        }

        smartApp.handleHttpCallback(req, res);
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).send('Internal Server Error');
    }
};
