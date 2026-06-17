require("dotenv").config();
const express = require("express");
const cors = require("cors");

const webhookRouter = require("./src/webhooks/whatsapp");
const leadsRouter = require("./src/routes/leads");
const contactsRouter = require("./src/routes/contacts");
const conversationsRouter = require("./src/routes/conversations");
const quotesRouter = require("./src/routes/quotes");
const analyticsRouter = require("./src/routes/analytics");

const app = express();

app.use(cors());

// Twilio sends form-encoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ status: "Chris AI Backend running 🚀" }));

// Routes
app.use("/webhook", webhookRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/analytics", analyticsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
