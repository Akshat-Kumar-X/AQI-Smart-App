const { SmartApp } = require('@smartthings/smartapp');
const getAQICalculator = require('../library');
const axios = require('axios');

const smartApp = new SmartApp()
    .enableEventLogging()
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

// Use SmartApp to handle all lifecycle requests
module.exports = async (req, res) => {
    try {
        await smartApp.handleHttpCallback(req, res);
    } catch (err) {
        console.error('Error processing SmartThings lifecycle request:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};
