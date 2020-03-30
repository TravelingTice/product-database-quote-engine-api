const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const _ = require('lodash');

// sendgrid
const sgMail = require('@sendgrid/mail');
// set api key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.preSignup = (req, res) => {
//   const { name, email, password } = req.body;

//   // check if user already exists
//   User.findOne({ email: email.toLowerCase() }, (err, user) => {
//     if (user) return res.status(400).json({ error: 'Email is taken' });

//     // create a token with user information
//     const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '20m' });

//     // email the user this token
//     // link to go to activate the account
//     const link = `${process.env.CLIENT_URL}/user/activate/${token}`;
//     // email data
//     const emailData = {
//       from: process.env.EMAIL_FROM,
//       to: email,
//       subject: `Please activate your account - ${process.env.APP_NAME}`,
//       text: `Please activate your account using the following link: \n${link}`,
//       html: `
//         <h2>Dear ${name}, Thank you for signing up on ${process.env.APP_NAME}!</h2>
//         <p>Please use the following link to activate your account:</p>
//         <p><a href="${link}">${link}</a></p>
//         <p>Look forward to having you on the team!</p>
//         <p><strong>- Avinash</strong></p>
//         <p><a href=${process.env.CLIENT_URL}>${process.env.CLIENT_URL}</a></p>
//       `
//     }

//     sgMail.send(emailData).then(sent => {
//       res.json({
//         message: `Email has been sent to ${email}. Please check your mail to activate your account!`
//       });
//     });
//   });
// }

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  
  User.findOne({ email }).exec((err, user) => {
    if (user) return res.status(400).json({ error: 'Email is already taken' });

    let username = shortId.generate();

    let newUser = new User({ name, email, password, username });
    newUser.save((err, success) => {
      // error handling
      if (err) return res.status(400).json({ error: err });

      // success
      return res.json({
        message: 'Signup success! Please signin.'
      });
    });
  });
}

// SIGN UP if using PRESIGNUP
// exports.signup = (req, res) => {
//   const { token } = req.body;
//   console.log('TOKEN', token);

//   if (!token) return res.status(400).json({ error: 'No token provided'});

//   // verify token
//   jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
//     console.log(err);
//     if (err) return res.status(401).json({ error: 'Expired link. Signup again' });

//     // get user information from jwt
//     const { name, email, password } = jwt.decode(token);

//     const username = shortId.generate();
//     const uniqueUsername = username;

//     const newUser = new User({ name, email, password, username, uniqueUsername });
//     newUser.save((err, success) => {
//       // error handling
//       if (err) return res.status(400).json({ error: errorHandler(err) });

//       // success
//       return res.json({
//         message: 'Signup success! Please signin.'
//       });
//     });
//   });
// }

exports.signin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    // check if user exists
    if (err || !user) return res.status(400).json({
      error: 'User with that email does not exist. Please signup.'
    });

    // authenticate
    if (!user.authenticate(password)) return res.status(400).json({
      error: 'Email and password do not match'
    });
    // generate a token to send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // set the cookie in the response
    res.cookie('token', token, { expiresIn: '1d' });
  
    const { _id, username, name, email, role } = user;
    // respond with the token and the user
    return res.json({
      token,
      user: { _id, username, name, email, role }
    });
  });
}

exports.signout = (req, res) => {
  // clear the cookie
  res.clearCookie('token');
  
  return res.json({
    message: 'Sign out success'
  });
}

// middleware for authorization of certain routes
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET
});

// middlewares
exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;

  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });

    req.profile = user;

    next();
  });
}

// admin middleware
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role !== 1) return res.status(401).json({ error: 'Admin resource. Access denied' });

    req.profile = user;

    next();
  });
}

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!user) return res.status(401).json({ error: 'User with that email does not exist' });

    // generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

    const resetLink = `${process.env.CLIENT_URL}/user/password/reset/${token}`

    // email data
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link - ${process.env.APP_NAME}`,
      text: `Link to reset your password: \n${resetLink}`,
      html: `
        <p>Please use the following link to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `
    }

    // populating the db > user > resetPasswordLink with token
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });

      // send email
      sgMail.send(emailData).then(sent => {
        return res.json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10 minutes.`
        });
      });
    });
  });
}

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (!resetPasswordLink) {
    return res.json({ error: 'Reset password link not provided' });
  } else {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Expired link. Try again' });

      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err) return res.status(400).json({ error: errorHandler(err) });

        if (!user) return res.status(404).json({ error: 'Token is invalid' });

        // user is there, so update the password
        const updatedFields = {
          password: newPassword,
          resetPasswordLink: ''
        }

        user = _.extend(user, updatedFields);

        user.save((err, result) => {
          if (err) return res.status(400).json({ error: errorHandler(err) });

          res.json({ message: 'Password updated!' });
        });
      });
    });
  }
}