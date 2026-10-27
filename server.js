
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = {
  beat1: { name: "BEAT ONE", prices: { basic: "29.99", premium: "59.99", unlimited: "99.99" } },
  beat2: { name: "BEAT TWO", prices: { basic: "29.99", premium: "59.99", unlimited: "99.99" } },
  beat3: { name: "BEAT THREE", prices: { basic: "29.99", premium: "59.99", unlimited: "99.99" } },
  beat4: { name: "BEAT FOUR", prices: { basic: "29.99", premium: "59.99", unlimited: "99.99" } },
  beat5: { name: "BEAT FIVE", prices: { basic: "29.99", premium: "59.99", unlimited: "99.99" } }
};

const baseUrl = process.env.PAYPAL_BASE_URL ||
  "https://api-m.sandbox.paypal.com";

async function paypalToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!id || !secret) throw new Error("PayPal credentials are missing.");

  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Unable to authenticate with PayPal.");

  return data.access_token;
}

app.get("/api/config", (req, res) => {
  res.json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || null
  });
});

app.post("/api/orders", async (req, res) => {
  try {
    const { beatId, licence } = req.body;
    const product = products[beatId];
    const price = product?.prices?.[licence];

    if (!product || !price) {
      return res.status(400).json({ error: "Invalid product or licence." });
    }

    const token = await paypalToken();
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: `${product.name} — ${licence} licence`,
          amount: {
            currency_code: "EUR",
            value: price
          },
          custom_id: `${beatId}:${licence}`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: "Could not create PayPal order." });
    }

    res.json({ id: data.id });
  } catch (error) {
    console.error("Create order failed:", error.message);
    res.status(500).json({ error: "Payment setup error." });
  }
});

app.post("/api/orders/:orderId/capture", async (req, res) => {
  try {
    const token = await paypalToken();
    const response = await fetch(
      `${baseUrl}/v2/checkout/orders/${encodeURIComponent(req.params.orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "COMPLETED") {
      return res.status(400).json({ error: "Payment was not completed." });
    }

    // Production checklist:
    // Verify order details and capture amount against your product database.
    // Store the transaction and licence in a database.
    // Deliver the purchased files only after verified payment.
    res.json({ status: data.status, orderId: data.id });
  } catch (error) {
    console.error("Capture failed:", error.message);
    res.status(500).json({ error: "Could not confirm payment." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Yizzy Beats running on port ${port}`);
});
