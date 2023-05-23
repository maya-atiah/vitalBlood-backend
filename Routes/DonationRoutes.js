const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../Middleware/userAuthMiddleware');

const { createDonationRequest,
    createBloodDonation,
    requestToDonate,
    getAllDonationRequests,
    getDonationsByUser,
    getDonationById, 
    acceptDonationRequest} = require('../Controllers/DonationController')


router.post('/createRequest',isAuthenticated, createDonationRequest);
router.post('/createDonation',isAuthenticated, createBloodDonation);
router.post('/donateToRequest/:donationRequestId', isAuthenticated, requestToDonate
);
router.post('/acceptDonationRequest/:donationRequestId', isAuthenticated, acceptDonationRequest);
router.get('/getAllDonationRequest', getAllDonationRequests);
router.get('/getDonationsByUser/:userId', getDonationsByUser);
router.get('/getDonationById/:donationId', getDonationById);

module.exports = router;