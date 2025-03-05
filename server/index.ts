import express from 'express';
import fileUpload from 'express-fileupload';
import { createServer } from 'vite';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { registerRoutes } from './routes';
import path from 'node:path';
import bodyParser from 'body-parser';
import { runMigrations } from './migration';

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  // تشغيل التهجير قبل بدء تشغيل التطبيق
  try {
    await runMigrations();
    console.log('تم تهجير قاعدة البيانات بنجاح');
  } catch (error) {
    console.error('خطأ في تهجير قاعدة البيانات:', error);
    // استمر في تشغيل التطبيق حتى لو فشل التهجير
  }

  app.use(fileUpload());
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  });

  app.use(sessionMiddleware);

  // Register API routes
  const httpServer = await registerRoutes(app);

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // In development, use Vite's development server
  if (process.env.NODE_ENV !== 'production') {
    const viteDevMiddleware = await import('./vite').then(module =>
      module.createViteDevMiddleware()
    );
    app.use(viteDevMiddleware);
  } else {
    // In production, serve the built client files
    app.use(express.static(path.join(process.cwd(), 'dist', 'client')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'client', 'index.html'));
    });
  }

  // Start the server
  httpServer.listen(port, () => {
    console.log(`تم تشغيل الخادم على المنفذ ${port}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
