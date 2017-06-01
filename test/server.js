import { join } from 'path';
import { app, setupRoutes } from '..';

setupRoutes(app, join(__dirname, 'routes'));
app.start();
