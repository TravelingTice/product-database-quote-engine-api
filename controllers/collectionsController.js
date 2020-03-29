const _ = require('lodash');
const slugify = require('slugify');

const { errorHandler } = require('../helpers/dbErrorHandler');

const Collection = require('../models/collection');

exports.list = (req, res) => {
  Collection.find({ isDeleted: false }).exec((err, collections) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    res.json(collections);
  });
}

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Collection.findOne({ slug, isDeleted: false }).exec((err, collection) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    return res.json(collection);
  });
}

exports.create = (req, res) => {
  const { name } = req.body;
  const collection = new Collection();

  collection.name = name;
  collection.slug = slugify(name).toLowerCase();

  collection.save((err, result) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    return res.json(result);
  });
}

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Collection.findOne({ slug, isDeleted: false }).exec((err, oldCollection) => {
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

  Collection.findOneAndUpdate({ slug, isDeleted: false }, { $set: { isDeleted: true } }, (err, result) => {
    if (err) return res.status(400).json({ error: errorHandler(err) });

    return res.json(result);
  });
}