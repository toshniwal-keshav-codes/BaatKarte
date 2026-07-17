import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { sendOtpEmail } from "./src/utils/brevo.js";

async function test() {
  console.log("Testing MongoDB Connection...");
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Connection Successful!");
    
    // Testing Brevo
    console.log("\nTesting Brevo Email Sending...");
    if (!env.BREVO_API_KEY) {
      console.log("❌ BREVO_API_KEY is not set in .env");
    } else {
      // Send test email to the sender email configured in .env
      const testEmail = env.BREVO_SENDER_EMAIL; 
      console.log("Sending test email to:", testEmail);
      
      await sendOtpEmail({
        to: testEmail,
        name: "Test User",
        code: "123456",
        purpose: "register"
      });
      console.log("✅ Brevo Email sent successfully!");
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
