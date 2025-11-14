import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import campaignRouter from './routes/campaign';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

// CORS configuration - allow specified origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://campaignwired.com', 'https://www.campaignwired.com'];

// Middleware
app.use(cors(
  {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      try {
        const requestOrigin = origin.toLowerCase();
        const isAllowed = allowedOrigins.some(allowedOrigin => {
          const allowed = allowedOrigin.toLowerCase();
          return requestOrigin === allowed || requestOrigin.endsWith(`.${allowed.replace(/^https?:\/\//, '')}`);
        });
        
        if (isAllowed) {
          return callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          return callback(new Error('Not allowed by CORS'));
        }
      } catch (error) {
        console.error('CORS error:', error);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Example route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Colla Code Backend API" });
});

// Mount campaign routes
app.use('/campaign', campaignRouter);
// Messages routes
import messagesRouter from './routes/messages';
app.use('/messages', messagesRouter);

// Webhooks
import webhooksRouter from './routes/webhooks';
app.use('/webhook', webhooksRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
