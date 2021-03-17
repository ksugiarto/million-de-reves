const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

require('./api/passport')();
require('./api/routes')(app);

// Set up default mongoose connection
const mongoSvcHost = process.env.MONGODB_SERVICE_SERVICE_HOST;
const mongoSvcPort = process.env.MONGODB_SERVICE_SERVICE_PORT;
const mdrDb = 'million-de-reves';
const mongoDbUrl = `mongodb://${ mongoSvcHost }:${ mongoSvcPort }/${ mdrDb }`;

// Local mongo
// const mongoDbUrl = `mongodb://localhost:27017/${ mdrDb }`;

mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(port, () => {
  console.log('Server started on port:', port);
})
