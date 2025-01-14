const i18n = require('i18n');
const path = require('path');

i18n.configure({
    locales: ['en'], // List of supported locales
    directory: path.join(__dirname, '../locales'), // Path to your locales folder
    defaultLocale: 'en',
    autoReload: true,
    updateFiles: false,
    objectNotation: true
});

const { SmartApp } = require('@smartthings/smartapp');
const getAQICalculator = require('../library');

// Create a new SmartApp instance
const smartApp = new SmartApp()
    .enableEventLogging() // Enable event logging for debugging
    .configureI18n() // Enable i18n for localization
    .page('mainPage', (context, page, configData) => {
        // Main configuration page
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
        // Handle updates (when the user saves settings)
        const settings = context.config;

        // Extract pollutant inputs and standard type
        const pollutants = {
            'SO2': parseFloat(settings.SO2?.[0]?.value || 0),
            'CO': parseFloat(settings.CO?.[0]?.value || 0),
            'O3': parseFloat(settings.O3?.[0]?.value || 0),
            'NO2': parseFloat(settings.NO2?.[0]?.value || 0),
            'PM10': parseFloat(settings.PM10?.[0]?.value || 0),
            'PM2.5': parseFloat(settings['PM2.5']?.[0]?.value || 0),
        };

        const standardType = settings.standardType?.[0]?.value || 'cai';

        // Get the appropriate AQI calculator
        const calculateAQI = getAQICalculator(standardType);
        const result = calculateAQI(pollutants);

        // Log the AQI result for debugging
        console.log(`AQI Result: ${JSON.stringify(result)}`);
    });

module.exports = smartApp;
