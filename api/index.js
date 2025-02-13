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
        page.name('Air Quality Input');
        page.nextPageId('resultPage');
        page.complete(false);

        page.section('Air Quality Inputs', section => {
            section.numberSetting('SO2').min(0).max(1).required(true).name('SO2 (ppm)');
            section.numberSetting('CO').min(0).max(50).required(true).name('CO (ppm)');
            section.numberSetting('O3').min(0).max(0.6).required(true).name('Ozone (O3, ppm)');
            section.numberSetting('NO2').min(0).max(2).required(true).name('NO2 (ppm)');
            section.numberSetting('PM10').min(0).max(600).required(true).name('PM10 (µg/m³)');
            section.numberSetting('PM2.5').min(0).max(500).required(true).name('PM2.5 (µg/m³)');
            section.enumSetting('standardType')
                .options([
                    { id: 'cai', name: 'South Korea (CAI)' },
                    { id: 'epa', name: 'USA (EPA)' },
                    { id: 'naqi', name: 'India (NAQI)' },
                    { id: 'fea', name: 'Germany (FEA)' },
                    { id: 'aqhi', name: 'Canada (AQHI)' }
                ])
                .required(true)
                .name('Standard Type');
        });
    })
    .page('resultPage', async (context, page) => {
        const installedAppId = context.installedAppId;
        const settings = await context.api.installedApps.getConfig(installedAppId);

        // Extract pollutant values correctly
        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.stringConfig.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.stringConfig.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.stringConfig.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.stringConfig.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.stringConfig.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.stringConfig.value || 0),
        };

        const standardType = settings.standardType?.[0]?.stringConfig.value || 'cai';

        // Get the correct AQI calculator
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);

        page.name('AQI Result');
        page.complete(true);

        page.section('Calculated AQI', section => {
            section.paragraphSetting('aqiValue')
                .name('AQI Calculation Result')
                .description(`AQI: ${result.AQI}\nCategory: ${result.category}\nColor: ${result.color}\nResponsible Pollutant: ${result.responsiblePollutant}`);
        });
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
