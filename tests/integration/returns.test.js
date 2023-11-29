// TEST DRIVEN DEVELOPMENT (TDD)

const moment = require('moment');
const { Movie } = require('../../models/movie');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
const request = require('supertest');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let movie;
    let rental;
    let token;

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    }

    beforeEach(async () => {
        server = require('../../index');

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });
        await rental.save();
    });
    afterEach(async () => {
        await server.close();
        await Movie.deleteMany({});
        await Rental.deleteMany({});
    });

    it('should return 401 if client is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not valid', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not valid', async () => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for the customer and movie combo', async () => {
        await Rental.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if rental has already been processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if rental is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the return date if rental is valid', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

        const diff = rentalInDb.dateReturned - new Date();
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee if rental is valid', async () => {
        rental.dateOut = moment().add(-7, 'days');
        rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increment the stock if rental is valid', async () => {
        await exec();

        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if it is valid', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        // expect(res.body).toHaveProperty('dateOut');
        // expect(res.body).toHaveProperty('dateReturned');
        // expect(res.body).toHaveProperty('rentalFee');
        // expect(res.body).toHaveProperty('customer');
        // expect(res.body).toHaveProperty('movie');

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
    });
});