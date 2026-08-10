import nodemailer from "nodemailer";
import { env } from "../config/env.js";

/**
 * Professional, production-ready Email Service using Nodemailer with SMTP.
 * Features:
 * - Connection, greeting, and socket timeouts to prevent hanging promises
 * - Transporter verification (transporter.verify())
 * - Retry logic for transient failures
 * - Structured logging at every step
 */
export class EmailService {
  constructor() {
    this.host = env.SMTP_HOST || "smtp.example.com";
    this.port = Number(env.SMTP_PORT) || 587;
    this.user = (env.SMTP_EMAIL || "").trim();
    this.pass = (env.SMTP_PASSWORD || "").trim();
    this.from =
      env.EMAIL_FROM || (this.user ? `BaatKarte <${this.user}>` : "noreply@example.com");

    this.isVerified = false;

    if (this.user && this.pass) {
      const isSecure = Number(process.env.SMTP_PORT) === 465;
      console.log(
        `[email-service] Initializing SMTP Transporter (host=${this.host}, port=${this.port}, secure=${isSecure}, user=${this.user})`,
      );

      this.transporter = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587 (STARTTLS)
        requireTLS: Number(process.env.SMTP_PORT) !== 465, // Enforce STARTTLS for port 587
        auth: {
          user: this.user,
          pass: this.pass,
        },
        // Socket & Connection Timeouts to prevent hanging Promises
        connectionTimeout: 10000, // 10 seconds to establish TCP connection
        greetingTimeout: 10000,   // 10 seconds for SMTP greeting
        socketTimeout: 15000,     // 15 seconds socket inactivity timeout
        dnsTimeout: 10000,        // 10 seconds DNS lookup timeout
      });

      // Run verification asynchronously on initialization
      this.verifyTransporter();
    } else {
      console.warn(
        "[email-service] WARNING: SMTP_EMAIL or SMTP_PASSWORD not configured. Emails will be skipped.",
      );
      this.transporter = null;
    }
  }

  /**
   * Verify SMTP transporter connection & credentials using transporter.verify().
   */
  async verifyTransporter() {
    if (!this.transporter) return false;

    console.log("[email-service] Verifying SMTP transporter connection...");
    try {
      // Wrap verify() in a 15s timeout to prevent hanging on verification
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP verification timed out after 15s")), 15000),
      );

      await Promise.race([verifyPromise, timeoutPromise]);
      this.isVerified = true;
      console.log("[email-service] ✅ SMTP Transporter verified successfully! Ready to send emails.");
      return true;
    } catch (err) {
      this.isVerified = false;
      console.error(`[email-service] ❌ SMTP Transporter verification failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Helper to execute sendMail with a strict 15-second timeout wrapper.
   */
  async _sendMailWithTimeout(mailOptions, timeoutMs = 15000) {
    if (!this.transporter) {
      throw new Error("SMTP Transporter not configured");
    }

    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        timer = null;
        reject(new Error(`SMTP sendMail timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      this.transporter.sendMail(mailOptions, (err, info) => {
        if (!timer) return; // already timed out
        clearTimeout(timer);
        if (err) {
          return reject(err);
        }
        resolve(info);
      });
    });
  }

  /**
   * Internal helper to execute email sends with 1 retry on transient failures.
   */
  async _sendWithRetry({ to, subject, html }) {
    if (!this.transporter || !this.user || !this.pass) {
      console.warn(
        `[email-service] SMTP credentials missing (SMTP_EMAIL/SMTP_PASSWORD) — skipped sending email to ${to}`,
      );
      throw new Error("SMTP credentials missing on server. Check SMTP_EMAIL and SMTP_PASSWORD.");
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < 2) {
      attempt++;
      console.log(
        `[email-service] Dispatching email to: ${to} | Subject: "${subject}" (Attempt ${attempt}/2)`,
      );
      try {
        const info = await this._sendMailWithTimeout(
          {
            from: this.from,
            to,
            subject,
            html,
          },
          15000, // 15s timeout limit
        );

        console.log(
          `[email-service] ✅ sendMail success to ${to}: MessageId=${info.messageId} | Response="${info.response}"`,
        );
        return { messageId: info.messageId, response: info.response };
      } catch (err) {
        lastError = err;
        console.error(
          `[email-service] ❌ Attempt ${attempt} failed for ${to}: ${err.message}`,
        );
        if (attempt < 2) {
          console.log("[email-service] Waiting 1s before retry...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    console.error(
      `[email-service] ❌ Email delivery failed permanently after 2 attempts for ${to}: ${lastError?.message}`,
    );
    throw new Error(
      `Email delivery failed: ${lastError?.message || "SMTP connection error"}`,
    );
  }

  /**
   * Send OTP verification email for registration or login.
   */
  async sendOTPEmail({ to, name, code, purpose }) {
    const isRegister = purpose === "register";
    const subject = isRegister
      ? "Welcome to BaatKarte — verify your email"
      : "Your BaatKarte login code";

    const html = this._renderOTPTemplate({ name, code, purpose });
    return this._sendWithRetry({ to, subject, html });
  }

  /**
   * Send Welcome email to newly onboarded user.
   */
  async sendWelcomeEmail({ to, name }) {
    const subject = "Welcome to BaatKarte!";
    const html = this._renderWelcomeTemplate({ name });
    return this._sendWithRetry({ to, subject, html });
  }

  // ─── HTML TEMPLATES ─────────────────────────────────────────────────────────

  _renderOTPTemplate({ name, code, purpose }) {
    const isRegister = purpose === "register";
    const heading = isRegister ? "Welcome to BaatKarte" : "Sign in to BaatKarte";
    const greeting = name ? `Hi ${this._escapeHtml(name)},` : "Hi,";
    const actionText = isRegister
      ? "Thank you for joining BaatKarte! Use the verification code below to complete your registration."
      : "Use the verification code below to complete your sign-in.";

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this._escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b12;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e7e7ee;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0b12;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#141422;border-radius:20px;overflow:hidden;border:1px solid #23233a;">
          <!-- Header Banner -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #23233a;background:linear-gradient(135deg,rgba(109,94,252,0.15),rgba(18,181,201,0.15));">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">${this._escapeHtml(heading)}</h1>
              <p style="margin:6px 0 0;color:#a4a4b8;font-size:13px;">Conversations that matter.</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;font-size:15px;color:#e7e7ee;">${greeting}</p>
              <p style="margin:0 0 24px;color:#c8c8d8;font-size:14px;line-height:1.6;">
                ${actionText} It expires in 10 minutes and can only be used once.
              </p>
              <!-- Centered OTP Box -->
              <div style="text-align:center;margin:32px 0;">
                <div style="display:inline-block;padding:16px 28px;border-radius:14px;background-color:#0b0b12;border:1px solid #2e2e4a;font-size:32px;letter-spacing:12px;font-weight:700;color:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
                  ${this._escapeHtml(code)}
                </div>
              </div>
              <p style="margin:28px 0 0;color:#7d7d95;font-size:12px;line-height:1.5;">
                If you didn't request this code, you can safely ignore this email. Someone may have typed your email address by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#0e0e18;border-top:1px solid #1a1a2e;text-align:center;font-size:12px;color:#5a5a72;">
              © ${new Date().getFullYear()} BaatKarte. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  _renderWelcomeTemplate({ name }) {
    const greeting = name ? `Hi ${this._escapeHtml(name)},` : "Hi,";
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BaatKarte</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b12;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e7e7ee;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0b12;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#141422;border-radius:20px;overflow:hidden;border:1px solid #23233a;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #23233a;background:linear-gradient(135deg,rgba(109,94,252,0.15),rgba(18,181,201,0.15));">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Welcome to BaatKarte 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;font-size:15px;">${greeting}</p>
              <p style="margin:0 0 20px;color:#c8c8d8;font-size:14px;line-height:1.6;">
                We're excited to have you on board! Start messaging your friends and colleagues in real-time right now.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  _escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]),
    );
  }
}

// Singleton instance
export const emailService = new EmailService();

// Standalone function exports for seamless API compatibility
export async function sendOTPEmail(params) {
  return emailService.sendOTPEmail(params);
}

// Alias matching old sendOtpEmail signature
export async function sendOtpEmail(params) {
  return emailService.sendOTPEmail(params);
}
