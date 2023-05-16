const Donation = require('../Models/DonationModel');

//****Place a Request */
exports.createDonationRequest = async (req, res) => {

    try {
        const { userId, firstName, lastName, dateOfBirth, caseType, caseDetails, bloodType, dateNeeded, hospital, levelOfEmergency } = req.body;


        const request = new Donation({
            receiver_id: userId,
            status: 'pending',
            type: 'request',
            details: {
                purpose: 'bloodRequest',
                patientInfo: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    caseType,
                    caseDetails,
                },
                bloodRequest: {
                    bloodType,
                    dateNeeded,
                    hospital,
                    levelOfEmergency,
                },
            },
        })

        await request.save();

        return res.json(request);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}


///***PLace a Donation */
exports.createBloodDonation = async (req, res) => {
    try {
        const donorId = req.user._id; // Assuming the donor is the authenticated user
        const { firstName, lastName, dateOfBirth, caseType, caseDetails, bloodType } = req.body;

        const donation = new Donation({
            donor_id: donorId,
            status: 'pending',
            type: 'donate',
            details: {
                purpose: 'bloodDonation',
                patientInfo: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    caseType,
                    caseDetails,
                },
                bloodRequest: {
                    bloodType,
                },
            },
        });

        await donation.save();

        return res.json(donation);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

////***Donate a request and inform the receiver to accept *///
exports.donateToRequest = async (req, res) => {
    try {
        const { donationRequestId, userId } = req.body;

        const donationRequest = await Donation.findById(donationRequestId)

        if (!donationRequest || donationRequest.type !== 'request' || donationRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Donation request not found or not pending' });
        }


        donationRequest.receiver_id = userId;
        donationRequest.status = 'accepted';


        await donationRequest.save();



        return res.json(donationRequest);


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


////***GEt all donations *////
exports.getAllDonationRequests = async (req, res) => {
    try {

        const donationRequests = await Donation.find({ type: 'request', status: 'pending' });

        return res.json(donationRequests);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//***** Get donations by a specific user***/////

exports.getDonationsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const donations = await Donation.find({
            $or: [{ donor_id: userId }, { receiver_id: userId }],
        });

        return res.json(donations);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



///***Get Donation by id */

exports.getDonationById = async (req, res) => {
    try {
        const donationId = req.params.donationId;
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        return res.json(donation);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};