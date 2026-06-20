const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"])
require("dotenv").config();

// Verify critical environment variables
const requiredEnv = ["DATABASE", "JWT_SECRET", "JWT_EXPIRES_IN"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`CRITICAL SERVER STARTUP WARNING: Environment variable "${key}" is not set!`);
  }
});

const mongoose = require("mongoose");

// UNCAUGHT EXCEPTION:
// process.on("uncaughtException", (err) => {
//   console.log(err.name, "-->", err.message);
//   console.log("UNCAUGHT EXCEPTION, SERVER SHUTTING DOWN...");
//   process.exit(1);
// });

const app = require("./app");
const User = require("./models/userModel");
// const { DB_URL } = require("./config/config");

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// console.log("dfsf", process.env.DATABASE)
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log("Database Connected ✓")
  })
  .catch((err) => console.log("DB Connection Error", "-->", err.message));


// Function to seed the admin
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail, role: 'aklogicAdmin' });
    if (adminExists) {
      console.log('Admin already exists');
      return;
    }

    // Create a new admin
    const newAdmin = new User({
      name: 'Admin',
      email: adminEmail,
      role: 'aklogicAdmin',
      password: adminPassword,
      confirmPassword: adminPassword,
      phone: '0000000000'
    });

    // Save the new admin to the database
    await newAdmin.save();
    console.log('Admin seeded successfully');
  } catch (error) {
    console.error(error);
  }
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async() =>{
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`)
  await seedAdmin();
});

// UNHANDLED PROMISE REJECTION CATCHER (GLOBALLY):
// process.on("unhandledRejection", (err) => {
//   console.log(err.name, "-->", err.message);
//   console.log("UNHANDLER REJECTION, SERVER SHUTTING DOWN...");
//   server.close(() => process.exit(1)); // Argument 0 for Success, and Argument 1 for Uncalled Exception
// });
