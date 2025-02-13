const { SmartApp } = require('@smartthings/smartapp');
const getAQICalculator = require('../library');
const i18n = require('i18n');
const path = require('path');

// Configure i18n
i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '../locales'),
    defaultLocale: 'en',
    autoReload: true,
    updateFiles: false,
    objectNotation: true
});

const smartApp = new SmartApp()
    .enableEventLogging()
    .configureI18n()
    .page('mainPage', (context, page, configData) => {
        page.name(i18n.__('pages.mainPage.name'));  // ✅ Fetching from en.json
        page.nextPageId('resultPage');
        page.complete(false);
    
        page.section(i18n.__('pages.mainPage.sections.gaseousPollutants.name'), section => {
            section.paragraphSetting('gaseousHeading')
                .name('🚀 Enter Gas Concentrations')
                .description('Provide the concentration levels of gaseous pollutants (ppm).');
    
            section.numberSetting('SO2')
                .min(0).max(1)
                .required(true)
                .name('🟠 Sulfur Dioxide (SO2, ppm)');
    
            section.numberSetting('CO')
                .min(0).max(50)
                .required(true)
                .name('🟢 Carbon Monoxide (CO, ppm)');
    
            section.numberSetting('O3')
                .min(0).max(0.6)
                .required(true)
                .name('🔵 Ozone (O3, ppm)');
    
            section.numberSetting('NO2')
                .min(0).max(2)
                .required(true)
                .name('🟣 Nitrogen Dioxide (NO2, ppm)');
        });
    
        page.section(i18n.__('pages.mainPage.sections.particulateMatter.name'), section => {
            section.paragraphSetting('pmHeading')
                .name('🌫️ Enter PM Levels')
                .description('Provide the levels of particulate matter (µg/m³).');
    
            section.numberSetting('PM10')
                .min(0).max(600)
                .required(true)
                .name('⚫ PM10 (µg/m³)');
    
            section.numberSetting('PM2.5')
                .min(0).max(500)
                .required(true)
                .name('⚫ PM2.5 (µg/m³)');
        });
    
        page.section(i18n.__('pages.mainPage.sections.aqiStandardSelection.name'), section => {
            section.enumSetting('standardType')
                .options([
                    { id: 'cai', name: '🇰🇷 CAI (South Korea)' },
                    { id: 'epa', name: '🇺🇸 EPA (USA)' },
                    { id: 'naqi', name: '🇮🇳 NAQI (India)' },
                    { id: 'fea', name: '🇩🇪 FEA (Germany)' },
                    { id: 'aqhi', name: '🇨🇦 AQHI (Canada)' }
                ])
                .required(true)
                .name('📊 Select AQI Calculation Standard')
                .description('Choose a standard for AQI calculation based on your location.');
        });
    })
    
    .page('resultPage', (context, page) => {
        page.name(i18n.__('pages.resultPage.name'));  // ✅ Fetching from en.json
    
        page.section(i18n.__('pages.resultPage.sections.calculatedAqi.name'), section => {
            section.paragraphSetting('aqiValue')
                .name('📈 AQI Calculation Result')
                .description(`AQI: ${result.AQI}\nCategory: ${result.category}\nColor: ${result.color}\nResponsible Pollutant: ${result.responsiblePollutant}`);
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
