import { Router } from 'express';
import { validateQuery } from '../middleware/validate';
import { geoSearchSchema } from '../schemas/weather.schemas';
import { searchHandler } from '../controllers/geo.controller';

const router = Router();

router.get('/search', validateQuery(geoSearchSchema), searchHandler);

export default router;
