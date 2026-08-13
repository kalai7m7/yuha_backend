/// <reference path="./types/express.d.ts" />
/// <reference path="./types/multer.d.ts" />

// Must use require() so dotenv runs BEFORE any other module is loaded.
// import statements are hoisted/compiled to require() calls at the top,
// meaning all imports resolve before any inline code runs — dotenv would
// be too late if written as `import dotenv … dotenv.config()`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

import app from './app';
import config from './config/config';

// Catch unhandled promise rejections so the process logs the error
// instead of silently exiting with a "clean exit".
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});