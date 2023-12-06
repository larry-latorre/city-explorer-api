'use strict';

class Forecast {
  constructor(date, description, highTemp, lowTemp) {
    this.date = date;
    this.description = description;
    this.highTemp = highTemp;
    this.lowTemp = lowTemp;
  }
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT;
const data = require('./weather.json');
app.use(cors());

app.get('/', (request, response) => {
  response.send('Hello, Express! How are you');
});

app.get('/weather', (request, response) => {
  const { lat, lon, searchQuery } = request.query;

  console.log('Received request with parameters:', { lat, lon, searchQuery });

  if (!lat || !lon || !searchQuery) {
    console.log('Missing required parameters (lat, lon, searchQuery)');
    response.status(400).json({ error: 'Missing required parameters (lat, lon, searchQuery)' });
  }

  const city = data.find(entry => entry.lat === lat && entry.lon === lon);

  if (!city) {
    console.log('City not found for the given parameters');
    response.status(404).json({ error: 'City not found for the given parameters' });
  }

  
  const forecasts = [];

  
  city.data.forEach(dayData => {
    const forecast = new Forecast(
      dayData.valid_date,
      dayData.weather.description,
      dayData.max_temp,
      dayData.min_temp
    );

    forecasts.push(forecast);
  });

  console.log('Forecasts:', forecasts);

  
  response.json({
    message: 'Weather data received',
    city,
    forecasts,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
