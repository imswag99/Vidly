const moment = require('moment');
const Joi = require('joi');
const { Movie } = require('../models/movie');
const { Rental } = require('../models/rental');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const express = require('express');
const router = express();

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    // Static = methods directly under class( eg: lookup )
    // Instance = methods under the object of a class( eg: new User().generateAuthToken() )
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('Rental not found');

    if (rental.dateReturned) return res.status(400).send('Rental already processed');

    rental.return();
    await rental.save();

    await Movie.updateOne({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    return res.send(rental);
});


function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(req);
}

module.exports = router;