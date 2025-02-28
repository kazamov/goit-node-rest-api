import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

import 'dotenv/config';

import HttpError from './helpers/HttpError.js';
import authRouter from './routes/authRouter.js';
import contactsRouter from './routes/contactsRouter.js';

const app = express();
const port = process.env['PORT'] || 3000;

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/contacts', contactsRouter);

app.use((_, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const { status = 500, message = 'Server error', errors } = err;
    res.status(status).json({ message, errors });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
