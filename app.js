'use strict';
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT;
app.use(cors());
const weatherApiKey = process.env.WEATHER_API_KEY;
const movieApiKey = process.env.MOVIE_API_KEY;

class MovieResult {
  constructor(id, title, overview, averageVotes, totalVotes, imageUrl, popularity, releasedOn) {
    this.id = id;
    this.title = title;
    this.overview = overview;
    this.averageVotes = averageVotes;
    this.totalVotes = totalVotes;
    this.imageUrl = imageUrl;
    this.popularity = popularity;
    this.releasedOn = releasedOn;
  }
}

app.get('/movies', async (request, response) => {
   const { city } = request.query;

  if (!city) {
    response.status(400).json({ error: 'Missing required parameter: city' });
    return;
  }

  try {
    const movieApiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${movieApiKey}?${city}`;
    const movieApiResponse = await axios.get(movieApiUrl);

    // Map the results to MovieResult objects
    const movieResults = movieApiResponse.data.results.map((result) => {
      return new MovieResult(
        result.id,
        result.title,
        result.overview,
        result.vote_average,
        result.vote_count,
        `https://image.tmdb.org/t/p/w500${result.poster_path}`, // Use the poster_path for the image URL
        result.popularity,
        result.release_date
      );
    });

    response.json(movieResults);
    return;
  } catch (error) {
    console.error('Error fetching movie data:', error.message);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

///////////////Get Weather////////////////////////
app.get('/weather', async (request, response) => {
  const { lat,lon } = request.query;
  

  if (!lat || !lon ) {
    
    response.status(400).json({ error: 'Missing required parameters (lat, lon,)' });
    return; 
  }

  const weatherApiUrl = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${weatherApiKey}`;

  
  try {
    const weatherApiResponse = await axios.get(weatherApiUrl);
    const city = weatherApiResponse.data; 
    if (!city) {
      console.log('City not found for the given parameters');
      response.status(404).json({ error: 'City not found for the given parameters' });
      return; 
    }
    
    const forecasts = city.data.map(dayData => {return new Forecast(
      dayData.datetime,
      dayData.weather.description,
      dayData.temp,
      dayData.app_temp
    )});
    response.json({forecasts});

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    response.status(500).json({ error: 'Internal server error' });
  }
});

class Forecast {
  constructor(date, description, highTemp, lowTemp) {
    this.date = date;
    this.description = description;
    this.highTemp = highTemp;
    this.lowTemp = lowTemp;
  }
}

///////////Get Movies///////////////////


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
