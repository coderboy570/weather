import { Router } from 'express';
import weatherRoutes from './weather.routes';
import geoRoutes from './geo.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'weather-api', time: new Date().toISOString() });
});

router.use('/weather', weatherRoutes);
router.use('/geo', geoRoutes);

export default router;
