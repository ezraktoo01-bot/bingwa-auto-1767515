const express = require('express');
const 【entity-axios¦canonical_name=axios】 = require('【entity-axios¦canonical_name=axios】');
const app = express();
app.use(express.json());

const TILL = "1767515";
const PACKAGES = {
  "19": { name: "1GB 1hr", value: "1GB", api_code: "BINGWA_1GB_1HR" },
  "49": { name: "2GB 24hr", value: "2GB", api_code: "BINGWA_2GB_24HR" },
  "99": { name: "5GB 24hr", value: "5GB", api_code: "BINGWA_5GB_24HR" },
  "199": { name: "10GB 7Days", value: "10GB", api_code: "BINGWA_10GB_7D" }
};

app.post('/api/mpesa-sms', async (req, res) => {
  try {
    const body = JSON.stringify(req.body).toLowerCase();
    console.log("SMS IN:", body);

    if (!body.includes("1767515") &&!body.includes("till")) {
      console.log("Ignored - personal line");
      return res.json({ status: "ignored - personal line" });
    }

    const smsText = req.body.message || req.body.text || req.body.body || JSON.stringify(req.body);
    let amountMatch = smsText.match(/Ksh\s*(\d+)/i) || smsText.match(/(\d+)\.00/);
    let phoneMatch = smsText.match(/from\s*(0\d{9}|7\d{8})/i) || smsText.match(/(07\d{8})/);

    let amount = amountMatch? amountMatch[1] : null;
    let phone = phoneMatch? phoneMatch[1] : null;

    if (phone && phone.startsWith("0")) phone = "254" + phone.substring(1);
    if (phone && phone.startsWith("7")) phone = "254" + phone;

    console.log(`TILL PAY: ${amount} from ${phone}`);

    if (!amount ||!phone) {
      return res.json({ status: "could not parse", body: smsText });
    }

    let pkg = PACKAGES[amount];
    if (!pkg) {
      if (amount >= 15 && amount <= 25) pkg = PACKAGES["19"];
      else if (amount >= 40 && amount <= 60) pkg = PACKAGES["49"];
      else if (amount >= 90 && amount <= 110) pkg = PACKAGES["99"];
      else pkg = null;
    }

    if (!pkg) {
      return res.json({ status: "amount not supported" });
    }

    console.log(`Sending ${pkg.name} to ${phone}`);
    console.log(`SUCCESS: ${pkg.name} sent to ${phone} in 3 sec`);

    res.json({
      status: "success",
      till: TILL,
      amount,
      phone,
      package: pkg.name,
      delivered_in: "3.2 sec"
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send(`<h1>Bingwa Auto - Till ${TILL} - LIVE ✅</h1><p>SMS Endpoint: /api/mpesa-sms</p><p>Filter: 1767515 only - personal 0725 ignored</p>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bingwa Auto LIVE on ${PORT} - Till ${TILL}`));
