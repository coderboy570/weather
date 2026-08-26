import type { Request, Response, NextFunction } from 'express';
import {
  getWeather,
  getCurrentWeather,
  getForecast,
} from '../services/weatherService';
import { getValidated } from '../middleware/validate';
import type { WeatherQuery } from '../schemas/weather.schemas';

/** GET /api/weather — full payload (current + hourly + daily). */
export async function weatherHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = getValidated<WeatherQuery>(req);
    const data = await getWeather({ city: q.city, lat: q.lat, lon: q.lon });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/** GET /api/weather/current — current conditions only. */
export async function currentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = getValidated<WeatherQuery>(req);
    const data = await getCurrentWeather({ city: q.city, lat: q.lat, lon: q.lon });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/** GET /api/weather/forecast — hourly + daily forecast only. */
export async function forecastHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = getValidated<WeatherQuery>(req);
    const data = await getForecast({ city: q.city, lat: q.lat, lon: q.lon });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
