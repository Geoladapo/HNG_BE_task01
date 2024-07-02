import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Access environment variables
const ipinfoToken = process.env.IPINFO_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;

console.log('IPINFO_TOKEN:', ipinfoToken);
console.log('WEATHER_API_KEY:', weatherApiKey);

app.get('/api/hello', async (req: Request, res: Response) => {
  const visitorName = (req.query.visitor_name as string) || 'Mark';
  let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const originalClientIp = clientIp; // Store the original IP for the response

  // Mock IP for local development
  if (clientIp === '::1' || clientIp === '127.0.0.1') {
    clientIp = '8.8.8.8'; // Example public IP address (Google DNS server)
  }

  try {
    // Fetch location data from ipinfo.io
    const locationResponse = await axios.get(
      `https://ipinfo.io/${clientIp}/json?token=${ipinfoToken}`
    );
    const location = locationResponse.data.city || 'New York';

    // Fetch weather data from OpenWeatherMap
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${weatherApiKey}`
    );

    const temperature = weatherResponse.data.main.temp;

    res.json({
      client_ip: originalClientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`,
    });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ error: 'Unable to fetch location or weather information' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
