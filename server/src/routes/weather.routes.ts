import { Router } from 'express';
import { validateQuery } from '../middleware/validate';
import { weatherQuerySchema } from '../schemas/weather.schemas';
import {
  weatherHandler,
  currentHandler,
  forecastHandler,
} from '../controllers/weather.controller';

const router = Router();

// Combined payload (used by the dashboard — one upstream call).
router.get('/', validateQuery(weatherQuerySchema), weatherHandler);

// Spec-compatible split endpoints.
router.get('/current', validateQuery(weatherQuerySchema), currentHandler);
router.get('/forecast', validateQuery(weatherQuerySchema), forecastHandler);

export default router;
