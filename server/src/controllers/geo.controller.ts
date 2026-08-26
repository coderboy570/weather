import type { Request, Response, NextFunction } from 'express';
import { searchLocations } from '../services/weatherService';
import { getValidated } from '../middleware/validate';
import type { GeoSearchQuery } from '../schemas/weather.schemas';

/** GET /api/geo/search — location autocomplete suggestions. */
export async function searchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = getValidated<GeoSearchQuery>(req);
    const results = await searchLocations(q.q, q.count);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}
