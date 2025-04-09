import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

import { getConfig } from '@/config.js';
import { EmailConfirmationTemplate } from '@/emails/ConfirmEmail.js';

const config = getConfig();
const { smtp } = config;
const { email, password, host, port, secure } = smtp;

const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(email && password ? { auth: { user: email, pass: password } } : {}),
});

export async function sendEmail(
    to: string,
    subject: string,
    html: string,
): Promise<ReturnType<typeof transporter.sendMail> | null> {
    try {
        const info = await transporter.sendMail({
            from: email,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}

export async function sendVerificationEmail(
    email: string,
    verificationToken: string,
): Promise<void> {
    const config = getConfig();

    const html = await render(
        <EmailConfirmationTemplate
            userName={email}
            confirmationLink={`${config.apiDomain}/api/auth/verify/${verificationToken}`}
            companyName="Contact Manager"
        />,
    );

    await sendEmail(email, 'Contacts API - Verification Email', html);
}
