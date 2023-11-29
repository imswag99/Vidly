const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genre');
const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express();


router.get('/', asyncMiddleware(async (req, res) => {
    // throw new Error("I threw this error.");
    const genres = await Genre.find().sort('name')
    res.send(genres);
}));



router.get('/:id', validateObjectId, asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);

    if (!genre) return res.status(404).send('The genre related to the specified ID is not found.');

    res.send(genre);
}));




router.post('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({ name: req.body.name })
    genre = await genre.save();

    res.send(genre);
}));




router.put('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })

    if (!genre) return res.status(404).send('The genre related to the specified ID is not found.');

    res.send(genre);
}));




router.delete('/:id', [auth, admin, validateObjectId], asyncMiddleware(async (req, res) => {

    const genre = await Genre.findByIdAndRemove(req.params.id);

    if (!genre) return res.status(404).send('The genre related to the specified ID is not found.');

    res.send(genre);
}));



module.exports = router;