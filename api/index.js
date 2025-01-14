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
        page.section('Air Quality Inputs', section => {
            section.numberSetting('SO2').min(0).max(1).required(true).name('SO2 (ppm)');
            section.numberSetting('CO').min(0).max(50).required(true).name('CO (ppm)');
            section.numberSetting('O3').min(0).max(0.6).required(true).name('Ozone (O3, ppm)');
            section.numberSetting('NO2').min(0).max(2).required(true).name('NO2 (ppm)');
            section.numberSetting('PM10').min(0).max(600).required(true).name('PM10 (µg/m³)');
            section.numberSetting('PM2.5').min(0).max(500).required(true).name('PM2.5 (µg/m³)');
            section.enumSetting('standardType')
                .options([
                    { id: 'cai', name: 'CAI (Comprehensive Air Quality Index)' },
                    { id: 'epa', name: 'EPA (US Environmental Protection Agency)' },
                    { id: 'naqi', name: 'NAQI (National Air Quality Index)' }
                ])
                .required(true)
                .name('Standard Type');
        });
    })
    .updated(async (context, updateData) => {
        const settings = context.config;

        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.value || 0),
        };

        const standardType = settings.standardType?.[0]?.value || 'cai';
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);

        console.log(`AQI Result: ${JSON.stringify(result)}`);
    });

module.exports = async (req, res) => {
    try {
        const { lifecycle, confirmationData } = req.body;

        // Handle CONFIRMATION Lifecycle
        if (lifecycle === 'CONFIRMATION') {
            console.log('CONFIRMATION request received:', confirmationData.confirmationUrl);
            await fetch(confirmationData.confirmationUrl);
            res.status(200).send('Confirmation successful');
            return;
        }

        // Delegate all other lifecycles to SmartApp
        smartApp.handleHttpCallback(req, res);
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).send('Internal Server Error');
    }
};
