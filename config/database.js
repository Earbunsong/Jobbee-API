const mongoose = require("mongoose");

const connectDatabase = () =>
  mongoose
    .connect(process.env.DB_LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: false, // Don't build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    })
    .then((con) => {
      console.log("MONGO database connect with house:", con.connection.host);
    })
    .catch((err) => console.log("Couldn't connect to", err));

module.exports = connectDatabase;
