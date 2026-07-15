import { env } from "../config/env.js";

export async function sendOtpEmail({ to, name, code, purpose }) {
  if (!env.BREVO_API_KEY) {
    console.warn(`[brevo] BREVO_API_KEY not set — OTP for ${to} = ${code}`);
    return { skipped: true };
  }

  const subject =
    purpose === "register" ? "Welcome to BaatKarte — verify your email" : "Your BaatKarte login code";

  const html = renderOtpHtml({ name, code, purpose });

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: to, name: name || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[brevo] send failed ${res.status}: ${body}`);
    throw new Error(`Email send failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

function renderOtpHtml({ name, code, purpose }) {
  const heading = purpose === "register" ? "Welcome to BaatKarte" : "Sign in to BaatKarte";
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  return `<!doctype html>
<html><body style="margin:0;background:#0b0b12;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e7e7ee;">
  <div style="max-width:520px;margin:40px auto;background:#141422;border-radius:20px;overflow:hidden;border:1px solid #23233a">
    <div style="padding:28px 32px;border-bottom:1px solid #23233a;background:linear-gradient(135deg,#6d5efc22,#12b5c922)">
      <h1 style="margin:0;font-size:22px;letter-spacing:-0.02em">${heading}</h1>
      <p style="margin:6px 0 0;color:#a4a4b8;font-size:13px">Conversations that matter.</p>
    </div>
    <div style="padding:28px 32px">
      <p style="margin:0 0 12px">${greeting}</p>
      <p style="margin:0 0 20px;color:#c8c8d8;font-size:14px;line-height:1.6">
        Use the code below to continue. It expires in 10 minutes and can only be used once.
      </p>
      <div style="display:inline-block;padding:14px 22px;border-radius:12px;background:#0b0b12;border:1px solid #2a2a44;font-size:28px;letter-spacing:12px;font-weight:700;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
        ${escapeHtml(code)}
      </div>
      <p style="margin:22px 0 0;color:#7d7d95;font-size:12px">
        If you didn't request this, you can ignore this email.
      </p>
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}