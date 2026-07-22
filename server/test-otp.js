// Quick test: hit /api/auth/register/start and report the result
const BASE = "http://127.0.0.1:4000";

async function main() {
  const endpoint = `${BASE}/api/auth/register/start`;
  const payload = {
    name: "OTP Test",
    username: "otptest" + Math.floor(Math.random() * 9999),  // short unique username
    email: "keshavtoshniwal.cs24@bmsce.ac.in",
  };

  console.log(`\n>>> POST ${endpoint}`);
  console.log(">>> Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log(`\n<<< Status: ${res.status} ${res.statusText}`);

    try {
      const json = JSON.parse(text);
      console.log("<<< Response JSON:", JSON.stringify(json, null, 2));
    } catch {
      console.log("<<< Response body:", text);
    }

    if (res.ok) {
      console.log("\n✅ SUCCESS — OTP request accepted. Check your inbox for the email.");
    } else {
      console.log("\n❌ FAILED — Server returned an error. See response above.");
    }
  } catch (err) {
    console.error("\n❌ NETWORK ERROR:", err.message);
    console.error("   Is the backend server running on port 4000?");
  }
}

main();
