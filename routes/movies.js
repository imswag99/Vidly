const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const { Genre } = require('../models/genre');
const { Movie, validate } = require('../models/movie');
const express = require('express');
const router = express();


router.get('/', asyncMiddleware(async (req, res) => {
    const movies = await Movie.find().sort('title')
    res.send(movies);
}));



router.get('/:id', asyncMiddleware(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) return res.status(404).send('The movie related to the specified ID is not found.');

    res.send(movie);
}));




router.post('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send('Invalid genre...');

    let movie = new Movie({ 
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })
    await movie.save();
    
    res.send(movie);
}));




router.put('/:id', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const movie = await Movie.findByIdAndUpdate(req.params.id, { title: req.body.title }, { new: true })

    if(!movie) return res.status(404).send('The movie related to the specified ID is not found.');

    res.send(movie);
}));




router.delete('/:id', asyncMiddleware(async (req, res) => {

    const movie = await Movie.findByIdAndRemove(req.params.id);

    if(!movie) return res.status(404).send('The movie related to the specified ID is not found.');

    res.send(movie);
}));



module.exports = router;