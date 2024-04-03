require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const { GOOGLE_API_KEY } = process.env;

const db = {
  distances: [
    {
      origin: 'abcd',
      destination: 'efg',
      mode: 'driving',
      distance: '3.5 km',
      duration: '10 min',
    },
  ],
};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Endpoint to calculate distance matrix
app.post('/api/distances', async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;

    // Make request to Google Maps Distance Matrix API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: origin,
          destinations: destination,
          mode,
          key: GOOGLE_API_KEY,
        },
      }
    );

    // Extract distance and duration from response
    const distance = response.data.rows[0].elements[0].distance.text;
    const duration = response.data.rows[0].elements[0].duration.text;

    const newDistance = {
      origin,
      destination,
      mode,
      distance,
      duration,
    };

    db.distances.push(newDistance);

    res.json({ distance, duration });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/distances', (req, res) => {
  res.json(db.distances);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
