import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends an email with both an HTML and a plain-text body.
 * Sending both versions is a basic trust signal for spam filters.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to,
            subject,
            html,
            text,
        });

        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};