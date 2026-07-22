import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { emailService } from "./src/services/email.service.js";

async function test() {
  console.log("Testing MongoDB Connection...");
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Connection Successful!");

    // Testing Resend Email Service
    console.log("\nTesting Resend Email Service...");
    if (!env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY is not set in .env");
    } else {
      const testEmail = "toshnikeshav24306@gmail.com";
      console.log("Sending test OTP email to:", testEmail);

      const res = await emailService.sendOTPEmail({
        to: testEmail,
        name: "Test User",
        code: "123456",
        purpose: "register",
      });

      console.log("✅ Resend Email sent successfully! Result:", res);
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
