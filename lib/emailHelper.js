import { readFile } from "fs/promises";
import nodemailer from "nodemailer";
import path from "path";

export class EmailHelper {
  /**
   * Create a Nodemailer transporter based on env variables.
   */
  static getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = port === 465; // true for 465, false for other ports

    if (!host || !user || !pass) {
      throw new Error(
        "SMTP configuration is missing. Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set in .env"
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  /**
   * Send a password‑reset email.
   * @param {string} toEmail Recipient email address
   * @param {string} resetToken JWT token generated for password reset
   */
  static async sendResetPassword(toEmail, resetToken) {
    const transporter = this.getTransporter();

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const resetLink = `${clientUrl}/reset_password?token=${resetToken}`;

    // Load a simple HTML template (feel free to customise later)
    const templatePath = path.resolve(import.meta.dirname, "templates", "resetPassword.html");
    let html;
    try {
      html = await readFile(templatePath, { encoding: "utf8" });
    } catch (_err) {
      // Fallback to a minimal inline template if the file is missing
      html = `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to choose a new password. The link expires in ${process.env.RESET_PASSWORD_EXPIRES_IN || "15m"}.</p>
        <a href="${resetLink}" style="display:inline-block;padding:8px 16px;background:#4a90e2;color:#fff;border-radius:4px;text-decoration:none;">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `;
    }

    // Inject the resetLink into the template (simple replace placeholder)
    const finalHtml = html.replace(/{{\s*resetLink\s*}}/g, resetLink);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: "Password Reset Instructions",
      html: finalHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    // For development with Ethereal, the preview URL is handy
    if (process.env.NODE_ENV !== "production" && info && info.url) {
      console.log("Preview URL: ", info.url);
    }
    return info;
  }

  /**
   * Compatibility wrapper – sendForgotPassword(email, resetLink)
   * Calls sendResetPassword internally (expects a token, but we can extract token from link).
   */
  static async sendForgotPassword(email, resetLink) {
    // Extract token from the resetLink if present
    let token = resetLink;
    try {
      const url = new URL(resetLink);
      token = url.searchParams.get("token") || resetLink;
    } catch (_) {
      // Not a valid URL – assume resetLink is the token itself
    }
    return await this.sendResetPassword(email, token);
  }

  /**
   * Send a simple email with a subject and body.
   */
  static async sendSimple(toEmail, subject, textOrHtml) {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
      html: textOrHtml, // We'll just pass the text as html since simple text works either way
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production" && info && info.url) {
      console.log("Preview URL: ", info.url);
    }
    return info;
  }
}
