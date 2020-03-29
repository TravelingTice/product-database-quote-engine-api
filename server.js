const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// to use environment variables
require('dotenv').config();

// bring routes
const collectionRoutes = require('./routes/collection');
const customerRoutes = require('./routes/customer');

// initialize express app
const app = express();

// environment
const dev = process.env.NODE_ENV !== 'production';

console.log('isDEV', dev);

// database connection
mongoose.connect(dev ? process.env.DATABASE_LOCAL : process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('DB connected'));

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

// cors
app.use(cors());

// routes middleware
app.use(collectionRoutes);
app.use(customerRoutes);

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});