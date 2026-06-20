const path = require("path");
const express = require("express");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const monogoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const globalErrorMiddleware = require("./middlewares/globalErrorMiddleware");
const routes = require("./routes");

const app = express();

// GLOBAL MIDDLEWARES:
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://rpcworld-bd.com",
    "https://www.rpcworld-bd.com",
    "https://admin.rpcworld-bd.com"
  ],
  credentials: true,
}));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/xwww-form-urlencoded

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serving static files
app.use(helmet()); // Set security HTTP headers

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, Please try again after an hour!",
// });

// app.use("/api", limiter); // Limit request from same IP
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(monogoSanitize()); // Data sanitization against NoSQL query injection --> "email": { "$gt": "" }

app.get("/api/v1/debug", async (req, res) => {
  const dns = require("dns");
  const net = require("net");
  const mongoose = require("mongoose");

  const debugInfo = {
    envDatabaseExists: !!process.env.DATABASE,
    databaseUriMasked: process.env.DATABASE 
      ? process.env.DATABASE.replace(/:([^@\s/]+)@/, ":xxxx@") 
      : null,
    mongooseConnectionState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };

  // Test DNS SRV resolution
  try {
    const dnsResolve = await new Promise((resolve) => {
      dns.resolveSrv("_mongodb._tcp.cluster0.trn515p.mongodb.net", (err, addresses) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, addresses });
        }
      });
    });
    debugInfo.dnsTest = dnsResolve;

    // Test TCP connection to one of the resolved SRV hosts on port 27017
    if (dnsResolve.success && dnsResolve.addresses.length > 0) {
      const targetHost = dnsResolve.addresses[0].name;
      const targetPort = dnsResolve.addresses[0].port || 27017;
      const tcpConnect = await new Promise((resolve) => {
        const client = net.connect({ host: targetHost, port: targetPort, timeout: 5000 }, () => {
          client.end();
          resolve({ success: true, message: `TCP Connection to ${targetHost}:${targetPort} succeeded!` });
        });
        client.on("error", (err) => {
          resolve({ success: false, message: `TCP Connection to ${targetHost}:${targetPort} failed: ${err.message}` });
        });
        client.on("timeout", () => {
          client.destroy();
          resolve({ success: false, message: `TCP Connection to ${targetHost}:${targetPort} timed out after 5 seconds` });
        });
      });
      debugInfo.tcpTest = tcpConnect;
    } else {
      debugInfo.tcpTest = { success: false, message: "Could not perform TCP test because DNS resolution failed or returned empty." };
    }
  } catch (err) {
    debugInfo.dnsTest = { success: false, error: err.message };
  }

  return res.json(debugInfo);
});

app.get("/", (req, res) => {
  return res.send("hello from okobiz");
});

app.use(routes);
app.use(globalErrorMiddleware);

module.exports = app;
