const { SmartApp } = require('@smartthings/smartapp');
const getAQICalculator = require('../library');
const i18n = require('i18n');
const path = require('path');

// ✅ Configure i18n
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

    // ✅ Main Page (Air Quality Input)
    .page('mainPage', (context, page) => {
        page.name(i18n.__('pages.mainPage.name'));
        page.nextPageId('resultPage');
        page.complete(false);

        // ✅ Section 1: Gaseous Pollutants
        page.section(i18n.__('pages.mainPage.sections.Gaseous Pollutants.name'), section => {
            section.paragraphSetting('gaseousHeading')
                .name('🚀 Enter Gas Concentrations')
                .description(i18n.__('pages.mainPage.sections.Gaseous Pollutants.description'));

            section.numberSetting('SO2').min(0).max(1).required(true).name('🟠 Sulfur Dioxide (SO2, ppm)');
            section.numberSetting('CO').min(0).max(50).required(true).name('🟢 Carbon Monoxide (CO, ppm)');
            section.numberSetting('O3').min(0).max(0.6).required(true).name('🔵 Ozone (O3, ppm)');
            section.numberSetting('NO2').min(0).max(2).required(true).name('🟣 Nitrogen Dioxide (NO2, ppm)');
        });

        // ✅ Section 2: Particulate Matter
        page.section(i18n.__('pages.mainPage.sections.Particulate Matter.name'), section => {
            section.paragraphSetting('pmHeading')
                .name('🌫️ Enter PM Levels')
                .description(i18n.__('pages.mainPage.sections.Particulate Matter.description'));

            section.numberSetting('PM10').min(0).max(600).required(true).name('⚫ PM10 (µg/m³)');
            section.numberSetting('PM2.5').min(0).max(500).required(true).name('⚫ PM2.5 (µg/m³)');
        });

        // ✅ Separator for Visual Structure
        page.section('separator', section => {
            section.paragraphSetting('separator')
                .name('----------------------------------------')
                .description('🔽 Choose AQI Calculation Standard 🔽');
        });

        // ✅ Section 3: AQI Standard Selection
        page.section(i18n.__('pages.mainPage.sections.AQI Standard Selection.name'), section => {
            section.enumSetting('standardType')
                .options([
                    { id: 'cai', name: i18n.__('pages.mainPage.settings.standardType.options.cai') },
                    { id: 'epa', name: i18n.__('pages.mainPage.settings.standardType.options.epa') },
                    { id: 'naqi', name: i18n.__('pages.mainPage.settings.standardType.options.naqi') },
                    { id: 'fea', name: i18n.__('pages.mainPage.settings.standardType.options.fea') },
                    { id: 'aqhi', name: i18n.__('pages.mainPage.settings.standardType.options.aqhi') }
                ])
                .required(true)
                .name(i18n.__('pages.mainPage.settings.standardType.name'))
                .description(i18n.__('pages.mainPage.settings.standardType.description'));
        });
    })

    // ✅ Result Page
    .page('resultPage', (context, page) => {
        const settings = context.config;

        // Extract pollutant values safely
        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.stringConfig?.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.stringConfig?.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.stringConfig?.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.stringConfig?.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.stringConfig?.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.stringConfig?.value || 0),
        };

        const standardType = settings.standardType?.[0]?.stringConfig?.value || 'cai';

        // Get AQI calculator
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);

        page.name(i18n.__('pages.resultPage.name'));
        page.complete(true);

        page.section(i18n.__('pages.resultPage.sections.Calculated AQI.name'), section => {
            section.paragraphSetting('aqiValue')
                .name('📈 AQI Calculation Result')
                .description(`AQI: ${result.AQI}\nCategory: ${result.category}\nColor: ${result.color}\nResponsible Pollutant: ${result.responsiblePollutant}`);
        });
    })
    
    // ✅ Lifecycle: Handle Updates
    .updated(async (context, updateData) => {
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

        // Get AQI calculator
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
