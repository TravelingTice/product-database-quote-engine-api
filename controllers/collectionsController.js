const _ = require('lodash');
const slugify = require('slugify');

const { errorHandler } = require('../helpers/dbErrorHandler');

const Collection = require('../models/collection');

exports.list = (req, res) => {
  Collection.find({ }).exec((err, collections) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    res.json(collections);
  });
}

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Collection.findOne({ slug }).exec((err, collection) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    return res.json(collection);
  });
}

exports.create = (req, res) => {
  const { name } = req.body;
  const collection = new Collection({ ...req.body });

  const slug = slugify(name).toLowerCase();

  collection.slug = slug;

  // check if there is not already one in db
  Collection.find({ slug }).exec((err, collections) => {
    if (collections.length > 0) return res.status(400).json({ error: 'Collection already exists' });

    // save in db
    collection.save((err, result) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });
  
      return res.json(result);
    });
  });
}

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Collection.findOne({ slug }).exec((err, oldCollection) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!oldCollection) return res.status(404).json({ error: 'Collection not found' });

    const newCollection = _.merge(oldCollection, req.body);

    newCollection.save((err, result) => {
      if (err) return res.status(400).json({ error: errorHandler(err) });

      res.json(result);
    });
  });
}

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Collection.findOneAndRemove({ slug }, (err, result) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    return res.json(result);
  });
}