import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { emailService } from "./src/services/email.service.js";

async function test() {
  console.log("Testing MongoDB Connection...");
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Connection Successful!");

    // Testing Nodemailer (Gmail SMTP) Email Service
    console.log("\nTesting Nodemailer Email Service...");
    if (!env.SMTP_EMAIL || !env.SMTP_PASSWORD) {
      console.log("❌ SMTP_EMAIL or SMTP_PASSWORD is not set in .env");
    } else {
      const testEmail = env.SMTP_EMAIL;
      console.log("Sending test OTP email to:", testEmail);

      const res = await emailService.sendOTPEmail({
        to: testEmail,
        name: "Test User",
        code: "123456",
        purpose: "register",
      });

      console.log("✅ Nodemailer Email sent successfully! Result:", res);
    }
  } catch (err) {
    console.error("\n❌ Error occurred during tests:");
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
