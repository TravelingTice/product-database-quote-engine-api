const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const slugify = require('slugify');

const Customer = require('../models/customer');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.list = (req, res) => {
  Customer.find({}).exec((err, customers) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    res.json(customers);
  });
}

exports.listFromUser = (req, res) => {
  const userSlug = req.params.slug.toLowerCase();
  // find user
  User.findOne({ userSlug }, (err, user) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!user) return res.status(404).json({ error: 'User not found' });

    Customer.find({ addedBy: user._id }).exec((err, customers) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });
  
      res.json(customers);
    });
  });
}

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Customer.findOne({ slug }).exec((err, customer) => {
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

    const { name } = fields;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    // create a new customer
    const customer = new Customer({
      ...fields
    });

    customer.slug = slugify(name).toLowerCase();
    customer.addedBy = req.user._id;

    // image upload
    if (files.businessCard) {
      if (files.businessCard.size > 10000000) return res.status(400).json({
        error: 'Image should be less than 1mb in size'
      });

      // put image in blog object
      customer.businessCard.data = fs.readFileSync(files.businessCard.path);
      customer.businessCard.contentType = files.businessCard.type;
    }

    // save blog post in the db
    customer.save((err, result) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });

      result.businessCard = undefined;

      return res.json(result);
    });
  });
}

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Customer.findOne({ slug }).exec((err, oldCustomer) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    let form = new formidable.IncomingForm();
    // .png keep .png etc
    form.keepExtensions = true;
    
    // parse the form with req object (has form data)
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(400).json({ error: 'Image could not upload' });

      // if the blog title is updated, the slug should not be changed
      let slugBeforeMerge = oldCustomer.slug;
      const newCustomer = _.merge(oldCustomer, fields);
      newCustomer.slug = slugBeforeMerge;
  
      const { name } = fields;
  
      // validate
      if (!name) return res.status(400).json({ error: 'Name is required' });
  
      // image upload
      if (files && files.photo) {
        if (files.photo.size > 10000000) return res.status(400).json({
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
  const slug = req.params.slug.toLowerCase();

  Customer.findOneAndRemove({ slug }, (err, result) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    return res.json(result);
  });
}
