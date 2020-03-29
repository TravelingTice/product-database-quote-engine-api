const formidable = require('formidable');
const fs = require('fs');

const Customer = require('../models/customer');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.list = (req, res) => {
  Customer.find({ isDeleted: false }).exec((err, customers) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    res.json(customers);
  });
}

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Customer.findOne({ slug, isDeleted: false }).exec((err, customer) => {
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
    if (files.photo) {
      if (files.photo.size > 10000000) return res.status(400).json({
        error: 'Image should be less than 1mb in size'
      });

      // put image in blog object
      customer.businessCard.data = fs.readFileSync(files.photo.path);
      blog.businessCard.contentType = files.photo.type;
    }

    // save blog post in the db
    customer.save((err, result) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });

      return res.json(result);
    });
  });
}

exports.update = (req, res) => {
  res.json({ todo: true });
}

exports.remove = (req, res) => {
  res.json({ todo: true });
}
