/// <reference path="./types/session.d.ts" />
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config/env';
import { pool } from './config/db';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { auditLog } from './middlewares/audit.middleware';
import { activityTracker } from './middlewares/session.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { sanitizeInput } from './middlewares/sanitization.middleware';
import { csrfTokenMiddleware, csrfProtection, getCSRFTokenHandler } from './middlewares/csrf.middleware';
import routes from './routes';

const app: Application = express();

// PostgreSQL session store
const PgSession = ConnectPgSimple(session);

// Security middleware - Enhanced Helmet.js configuration
app.use(helmet({
  // Content Security Policy - Prevent XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'], // Allow images from self, data URIs, HTTPS, and blobs
      connectSrc: ["'self'"], // Restrict AJAX/WebSocket connections
      fontSrc: ["'self'"], // Only allow fonts from same origin
      objectSrc: ["'none'"], // Disable plugins (Flash, Java, etc.)
      mediaSrc: ["'self'"], // Only allow media from same origin
      frameSrc: ["'none'"], // Prevent embedding in iframes
      baseUri: ["'self'"], // Restrict URL in <base> element
      formAction: ["'self'"], // Restrict form submissions
      upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
    },
  },
  
  // HTTP Strict Transport Security - Force HTTPS for 1 year
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Enable HSTS preload
  },
  
  // X-Frame-Options - Prevent clickjacking
  frameguard: {
    action: 'deny', // Don't allow any framing
  },
  
  // X-Content-Type-Options - Prevent MIME type sniffing
  noSniff: true,
  
  // X-XSS-Protection - Enable browser XSS filter
  xssFilter: true,
  
  // Referrer Policy - Control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions Policy (formerly Feature Policy)
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  
  // Cross-Origin settings
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false,
  },
  
  // IE No Open - Prevent IE from executing downloads
  ieNoOpen: true,
}));

// CORS
app.use(cors(config.cors));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Session management
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie,
    name: config.session.name,
  })
);

// Activity tracker (must be after session)
app.use(activityTracker);

// CSRF token generation (must be after session)
app.use(csrfTokenMiddleware);

// Input sanitization (sanitize all incoming data)
app.use(sanitizeInput);

// CSRF protection (validate tokens on state-changing requests)
app.use(csrfProtection);

// Audit logging
app.use(auditLog);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFTokenHandler);

// API Routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'KTH BTM API Server',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Apply API rate limiter to all API routes
app.use('/api', apiRateLimiter);

// Mount API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
