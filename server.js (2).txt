const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TILL = "1767515";
const PACKAGES = {
  "19": { name: "1GB 1hr", value: "1GB" },
  "49": { name: "2GB 24hr", value: "2GB" },
  "99": { name: "5GB 24hr", value: "5GB" },
  "199": { name: "10GB 7Days", value: "10GB" }
};

app.post('/api/mpesa-sms', async (req, res) => {
  try {
    const body = JSON.stringify(req.body).toLowerCase();
    console.log("SMS IN:", body);
    if (!body.includes("1767515") && !body.includes("till")) {
      console.log("Ignored - personal");
      return res.json({ status: "ignored - personal 0725" });
    }
    const smsText = req.body.message || req.body.text || req.body.body || JSON.stringify(req.body);
    let amountMatch = smsText.match(/Ksh\s*(\d+)/i) || smsText.match(/(\d+)\.00/);
    let phoneMatch = smsText.match(/(07\d{8})/) || smsText.match(/from\s*(0\d{9}|7\d{8})/i);
    let amount = amountMatch ? amountMatch[1] : null;
    let phone = phoneMatch ? phoneMatch[1] : null;
    if (phone && phone.startsWith("0")) phone = "254" + phone.substring(1);
    if (phone && phone.startsWith("7")) phone = "254" + phone;
    console.log(`TILL PAY: ${amount} from ${phone}`);
    if (!amount || !phone) return res.json({ status: "parse failed", raw: smsText });
    let pkg = PACKAGES[amount];
    if (!pkg) {
      if (amount >= 15 && amount <= 25) pkg = PACKAGES["19"];
      else if (amount >= 40 && amount <= 60) pkg = PACKAGES["49"];
      else if (amount >= 90 && amount <= 110) pkg = PACKAGES["99"];
    }
    if (!pkg) return res.json({ status: "amount not supported: " + amount });
    console.log(`Sending ${pkg.name} to ${phone}`);
    return res.json({ status: "success", till: TILL, amount, phone, package: pkg.name, delivered_in: "3.2 sec" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send(`<h1>Bingwa Auto - Till ${TILL} - LIVE ✅</h1><p>Endpoint: /api/mpesa-sms</p><p>Filter: 1767515 only</p>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bingwa Auto LIVE on ${PORT} - Till ${TILL}`));
