
import { env } from './config/env'
import app from './app'
import logger from './utils/logger';



const PORT = env.PORT || 4000



app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT} `);
});




