const express = require('express');
const router = express.Router();

const { createDonationRequest,
    createBloodDonation,
    donateToRequest,
    getAllDonationRequests,
    getDonationsByUser,
    getDonationById } = require('../Controllers/DonationController')


router.post('/createRequest', createDonationRequest);
router.post('/createDonation', createBloodDonation);
router.post('/donateToRequest', donateToRequest);
router.get('/getAllDonationRequest', getAllDonationRequests);
router.get('/getDonationsByUser/:userId', getDonationsByUser);
router.get('/getDonationById/:donationId', getDonationById);

module.exports = router;