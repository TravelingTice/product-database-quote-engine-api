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

    res.json(customer);
  });
}

exports.create = (req, res) => {
  
}

exports.update = (req, res) => {
  
}

exports.remove = (req, res) => {
  
}
