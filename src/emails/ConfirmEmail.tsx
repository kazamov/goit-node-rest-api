import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { CSSProperties } from 'react';

interface EmailConfirmationTemplateProps {
    userName?: string;
    confirmationLink?: string;
    companyName?: string;
}

export const EmailConfirmationTemplate = ({
    userName = 'User',
    confirmationLink = 'https://yourapp.com/confirm?token=123456789',
    companyName = 'Contact Manager',
}: EmailConfirmationTemplateProps) => {
    return (
        <Html>
            <Head />
            <Preview>Confirm your email address for {companyName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Verify your email address</Heading>
                    <Text style={paragraph}>Hi {userName},</Text>
                    <Text style={paragraph}>
                        Thanks for signing up for {companyName}! Please confirm your email address
                        by clicking the button below.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={confirmationLink}>
                            Confirm Email Address
                        </Button>
                    </Section>
                    <Hr style={hr} />
                    <Text style={footer}>
                        If the button above doesn't work, copy and paste this URL into your browser:
                    </Text>
                    <Text style={link}>
                        <Link href={confirmationLink} style={link}>
                            {confirmationLink}
                        </Link>
                    </Text>
                    <Text style={footer}>
                        &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default EmailConfirmationTemplate;

const main: CSSProperties = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: CSSProperties = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '24px',
    borderRadius: '4px',
    maxWidth: '600px',
};

const heading: CSSProperties = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    textAlign: 'center',
};

const paragraph: CSSProperties = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#484848',
};

const buttonContainer: CSSProperties = {
    textAlign: 'center',
    margin: '32px 0',
};

const button: CSSProperties = {
    backgroundColor: '#5e6ad2',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    padding: '12px 16px',
};

const hr: CSSProperties = {
    borderColor: '#e6ebf1',
    margin: '32px 0',
};

const link: CSSProperties = {
    color: '#5e6ad2',
    fontSize: '14px',
    wordBreak: 'break-all',
};

const footer: CSSProperties = {
    color: '#9ca299',
    fontSize: '14px',
    marginTop: '12px',
};
