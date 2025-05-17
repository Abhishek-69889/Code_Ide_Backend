const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const connectDB = require("./connect");
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

connectDB();

// view engine setup (if you still want to keep EJS views for some routes)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://codexa-eta.vercel.app',
  'https://codexa-doa2zsajd-abhishek-tiwaris-projects-53c4c16e.vercel.app'
];

// Middleware to set headers before CORS is applied
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Handle preflight requests
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// API routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Serve React static files from the build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// SPA fallback: send index.html for any other routes (to let React Router handle them)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page (EJS)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
