import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';

import { testDatabaseConnection } from './db/sequelize.js';
import HttpError from './helpers/HttpError.js';
import authRouter from './routes/authRouter.js';
import contactsRouter from './routes/contactsRouter.js';
import { getConfig } from './config.js';

const config = getConfig();

if (!config.isTest) {
    await testDatabaseConnection();
}

const app = express();
const port = config.port;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

if (!config.isTest) {
    app.use(limiter);
}
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.status(200).send('Health check');
});
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);

app.use((_, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const { status = 500, message = 'Server error', errors } = err;
    res.status(status).json({ message, errors });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port} in ${config.env} mode`);
});
