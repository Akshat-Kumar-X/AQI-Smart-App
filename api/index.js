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

module.exports = async (req, res) => {
    try {
        const { lifecycle, confirmationData, config } = req.body;

        // CONFIRMATION Lifecycle
        if (lifecycle === 'CONFIRMATION') {
            console.log('Received CONFIRMATION lifecycle:', confirmationData.confirmationUrl);
            try {
                await axios.get(confirmationData.confirmationUrl);
                console.log('Successfully confirmed webhook registration');
                res.status(200).send('Webhook confirmed');
            } catch (err) {
                console.error('Error confirming webhook registration:', err.message);
                res.status(500).send('Failed to confirm webhook registration');
            }
            return;
        }

        // UPDATED Lifecycle
        if (lifecycle === 'UPDATED') {
            console.log('Received UPDATED lifecycle');
            const settings = config;

            const pollutants = {
                'SO2': parseFloat(settings.SO2?.[0]?.value || 0),
                'CO': parseFloat(settings.CO?.[0]?.value || 0),
                'O3': parseFloat(settings.O3?.[0]?.value || 0),
                'NO2': parseFloat(settings.NO2?.[0]?.value || 0),
                'PM10': parseFloat(settings.PM10?.[0]?.value || 0),
                'PM2.5': parseFloat(settings['PM2.5']?.[0]?.value || 0),
            };

            const standardType = settings.standardType?.[0]?.value;

            if (!standardType || !['cai', 'epa', 'naqi'].includes(standardType.toLowerCase())) {
                throw new Error(`Invalid AQI standard type: ${standardType}`);
            }

            const calculateAQI = getAQICalculator(standardType);
            const result = calculateAQI(pollutants);

            console.log(`AQI Result: ${JSON.stringify(result)}`);
            res.status(200).json(result);
            return;
        }

        // Unsupported Lifecycle
        res.status(400).json({ error: `Unsupported lifecycle: ${lifecycle}` });
    } catch (err) {
        console.error('Error processing request:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};
