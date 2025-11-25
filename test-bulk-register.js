const fs = require("fs");
const path = require("path");

/**
 * Test script for bulk student registration API
 *
 * Usage:
 * 1. First, generate test Excel file: node create-test-excel.js
 * 2. Get an auth token from login endpoint
 * 3. Update TOKEN and NODE_ID below
 * 4. Run: node test-bulk-register.js
 */

const TOKEN = "YOUR_AUTH_TOKEN_HERE";
const NODE_ID = "YOUR_NODE_ID_HERE"; // Optional, uses creator's node_id if not provided
const API_URL = "http://localhost:3000/api/students/bulk-register";

async function testBulkRegister() {
  try {
    // Check if test file exists
    const filePath = path.join(__dirname, "students_test.xlsx");
    if (!fs.existsSync(filePath)) {
      console.error("❌ Test file not found. Run: node create-test-excel.js");
      process.exit(1);
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Create FormData
    const FormData = require("form-data");
    const form = new FormData();
    form.append("file", fileBuffer, "students_test.xlsx");
    if (NODE_ID) {
      form.append("node_id", NODE_ID);
    }

    // Make request
    console.log("📤 Sending bulk registration request...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();

    // Display results
    console.log("\n📊 Response Status:", response.status);
    console.log("\n📋 Results:");
    console.log(JSON.stringify(result, null, 2));

    if (result.results) {
      console.log("\n✅ Summary:");
      console.log(`Total: ${result.results.summary.total}`);
      console.log(`Successful: ${result.results.summary.successCount}`);
      console.log(`Failed: ${result.results.summary.failureCount}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testBulkRegister();
