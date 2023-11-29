const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const { Rental, validate } = require('../models/rental');
const mongoose = require('mongoose');
const express = require('express');
const router = express();


router.get('/', asyncMiddleware(async (req, res) => {
    const rentals = await Rental.find().sort('name')
    res.send(rentals);
}));



router.get('/:id', asyncMiddleware(async (req, res) => {
    const rental = await Rental.findById(req.params.id);

    if(!rental) return res.status(404).send('The rental related to the specified ID is not found.');

    res.send(rental);
}));




router.post('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(404).send('Invalid customer...');

    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(404).send('Invalid movie...');

    let rental = new Rental({ 
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    })
    await rental.save();

    movie.numberInStock--;
    movie.save();

    res.send(rental);
}));




router.put('/:id', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const rental = await Rental.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })

    if(!rental) return res.status(404).send('The rental related to the specified ID is not found.');

    res.send(rental);
}));




router.delete('/:id', asyncMiddleware(async (req, res) => {

    const rental = await Rental.findByIdAndRemove(req.params.id);

    if(!rental) return res.status(404).send('The rental related to the specified ID is not found.');

    res.send(rental);
}));



module.exports = router;