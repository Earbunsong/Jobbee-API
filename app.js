const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const errorMiddleware = require('./middlewares/error')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
//import database connection
const connectDatabase = require("./config/database");
const errorhandle = require("./utils/errorhandle");

//setting up config.env file variable

dotenv.config({ path: "./config/config.env" });

connectDatabase();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//import all route
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const users = require("./routes/users")

//middleware

//create own middleware
const middleware = (req, res, next) => {
  console.log("successfully...!!");

  //setting up user variable globally
  req.requestMethod = req.method;
  next();
};
app.use(middleware);
app.use("/api/v1/job", jobs);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users)

app.all("*", (req, res, next) => {
  next(new errorhandle(`${req.originalUrl} route not found`, 404));
});

// set cookin parser
app.use(cookieParser());

// handle file upload
app.use(fileUpload());

//set up security headers
app.use(helmet());

// rate limiting 
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // 100 request per 10 minutes
});
app.use(limiter);

// sanitize data
app.use(mongoSanitize());

// prevent xss attack
app.use(xss());

// prevent http param pollution
app.use(hpp(
  {
    whitelist: [
      'positions',
      'location',
      'description',
      'requirements',
      'salary',
      'company',
      'address',
      'email',
      'phone',
      'jobType',
      'website',
      'createdAt',
      'updatedAt'
    ]
  }
));

// enable cors
app.use(cors());

app.use(express.static('public'));

app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(
    "Server run on port " + PORT + " in " + process.env.NODE_ENV + " mode"
  );
});

// handle unhandle error
process.on("unhandledRejection", (err) => {
  console.log("error : ", err.message);
  console.log("Shutting down the server dur to handled promiss rejection");

  server.close(() => {
    process.exit(1);
  });
});
