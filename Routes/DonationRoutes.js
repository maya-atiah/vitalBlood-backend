const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../Middleware/userAuthMiddleware');

const { createDonationRequest,
    createBloodDonation,
    requestToDonate,
    getAllDonationRequests,
    getDonationsByUser,
    getDonationById, 
    acceptDonationRequest,
    deleteDonationById} = require('../Controllers/DonationController')


router.post('/createRequest',isAuthenticated, createDonationRequest);
router.post('/createDonation',isAuthenticated, createBloodDonation);
router.post('/donateToRequest/:donationRequestId', isAuthenticated, requestToDonate
);
router.post('/acceptDonationRequest/:donationRequestId', isAuthenticated, acceptDonationRequest);
router.get('/getAllDonationRequest', getAllDonationRequests);
router.get('/getDonationsByUser',isAuthenticated, getDonationsByUser);
router.get('/getDonationById/:donationId', getDonationById);
router.delete('/deleteDonationById/:donationId', isAuthenticated, deleteDonationById)

module.exports = router;