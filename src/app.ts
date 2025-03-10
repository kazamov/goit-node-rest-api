// eslint-disable-next-line simple-import-sort/imports
import { getConfig } from './config.js';

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

import HttpError from './helpers/HttpError.js';
import authRouter from './routes/authRouter.js';
import contactsRouter from './routes/contactsRouter.js';
import { testDatabaseConnection } from './db/sequelize.js';

const config = getConfig();

if (!config.isTest) {
    await testDatabaseConnection();
}

const app = express();
const port = config.port;

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
