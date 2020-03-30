const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const emailValidator = require('email-validator');

const Customer = require('../models/customer');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.list = (req, res) => {
  Customer.find({})
  .select('-businessCard')
  .exec((err, customers) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    res.json(customers);
  });
}

exports.listFromUser = (req, res) => {
  const userId = req.params.id.toLowerCase();
  // find user
  User.findOne({ _id: id })
  .select('-businessCard').exec((err, user) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!user) return res.status(404).json({ error: 'User not found' });

    Customer.find({ addedBy: user._id }).exec((err, customers) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });
  
      res.json(customers);
    });
  });
}

exports.read = (req, res) => {
  const id = req.params.id;
  Customer.findOne({ _id: id }).exec((err, customer) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  });
}

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();

  form.keepExtensions = true;

  // parse the form with req object (has form data)
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Image could not upload' });

    const { name, email } = fields;

    // check if we already have a customer with this name
    Customer.findOne({ name }, (err, customer) => {
      if (customer) return res.status(400).json({ error: `Customer with name ${name} already exists` });

      // validations
      if (!name) return res.status(400).json({ error: 'Name is required' });
      if (!email) return res.status(400).json({ error: 'Email is required' });
      if (!emailValidator.validate(email)) return res.status(400).json({ error: 'Has to be a valid email' });
  
      // create a new customer
      const newCustomer = new Customer({
        ...fields
      });
  
      newCustomer.addedBy = req.user._id;
  
      // image upload
      if (files.businessCard) {
        if (files.businessCard.size > 10000000) return res.status(400).json({
          error: 'Image should be less than 1mb in size'
        });
  
        // put image in blog object
        newCustomer.businessCard.data = fs.readFileSync(files.businessCard.path);
        newCustomer.businessCard.contentType = files.businessCard.type;
      }
  
      // save blog post in the db
      newCustomer.save((err, result) => {
        if (err) return res.status(400).json({ error: errorHandler(err) });
  
        result.businessCard = undefined;
  
        return res.json(result);
      });

    });

  });
}

exports.update = (req, res) => {
  const id = req.params.id.toLowerCase();

  Customer.findOne({ _id: id }).exec((err, oldCustomer) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    let form = new formidable.IncomingForm();
    // .png keep .png etc
    form.keepExtensions = true;
    
    // parse the form with req object (has form data)
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(400).json({ error: 'Image could not upload' });

      const newCustomer = _.merge(oldCustomer, fields);
    
      // validate
      if (!newCustomer.name) return res.status(400).json({ error: 'Name is required' });
      if (!newCustomer.email) return res.status(400).json({ error: 'Email is required' });
      if (!emailValidator.validate(newCustomer.email)) return res.status(400).json({ error: 'Has to be a valid email' });
  
      // image upload
      if (files && files.businessCard) {
        if (files.businessCard.size > 10000000) return res.status(400).json({
          error: 'Image should be less than 1mb in size'
        });
  
        // put image in blog object
        newCustomer.businessCard.data = fs.readFileSync(files.photo.path);
        newCustomer.businessCard.contentType = files.photo.type;
      }
  
      // save newBlog post in the db
      newCustomer.save((err, result) => {
        if (err) return res.status(400).json({ error: errorHandler(err) });
  
        // send result without photo
        result.businessCard = undefined;
        res.json(result);
      });
    });
  });
}

exports.remove = (req, res) => {
  const id = req.params.id;

  Customer.findOneAndRemove({ _id: id }, (err, result) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    return res.json(result);
  });
}
