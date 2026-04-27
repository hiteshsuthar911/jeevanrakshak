const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const city = req.query.city || 'Mumbai';
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
      // Return mock weather data when no API key is set
      return res.json({
        city,
        temperature: 28 + Math.round(Math.random() * 8),
        condition: ['Heavy Rain', 'Thunderstorm', 'Cloudy', 'Moderate Rain'][Math.floor(Math.random() * 4)],
        humidity: 75 + Math.round(Math.random() * 20),
        windSpeed: 20 + Math.round(Math.random() * 30),
        rainfall: Math.round(Math.random() * 80),
        icon: '10d',
        floodRisk: Math.random() > 0.5 ? 'High' : 'Medium',
        mock: true
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}&units=metric`
    );
    const d = response.data;
    res.json({
      city,
      temperature: Math.round(d.main.temp),
      condition: d.weather[0].description,
      humidity: d.main.humidity,
      windSpeed: Math.round(d.wind.speed * 3.6),
      rainfall: d.rain ? d.rain['1h'] || 0 : 0,
      icon: d.weather[0].icon,
      floodRisk: d.rain && d.rain['1h'] > 30 ? 'High' : d.main.humidity > 85 ? 'Medium' : 'Low',
      mock: false
    });
  } catch (err) {
    res.status(500).json({ message: 'Weather data unavailable', mock: true });
  }
});

module.exports = router;
