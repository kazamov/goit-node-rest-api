import nodemailer from 'nodemailer';

import { getConfig } from '@/config.js';

const config = getConfig();
const { smtp } = config;
const { email, password, host, port } = smtp;

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
        user: email,
        pass: password,
    },
});

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
): Promise<ReturnType<typeof transporter.sendMail> | null> {
    try {
        const info = await transporter.sendMail({
            from: email,
            to,
            subject,
            text,
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}
