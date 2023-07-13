const Donation = require('../Models/DonationModel');
const UserDetails = require('../Models/UserDetailsModel')
const RequestToDonate = require('../Models/RequestToDonate');
const Notification = require('../Models/NotificationModel')
const NotificationUser = require('../Models/NotificationUserModel')
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');


//****Place a Request */
exports.createDonationRequest = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            caseType,
            caseDetails,
            bloodType,
            dateNeeded,
            hospital,
            levelOfEmergency,
            numberOfUnits
        } = req.body;

        // Create a new donation request
        const donationRequest = new Donation({
            receiver_id: req.user,
            status: 'pending',
            type: 'request',
            details: {
                purpose: 'bloodRequest',
                patientInfo: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    caseType,
                    caseDetails
                },
                bloodRequest: {
                    bloodType,
                    dateNeeded,
                    hospital,
                    levelOfEmergency,
                    numberOfUnits
                }
            }
        });

        await donationRequest.save();

        const logoPath = path.join(__dirname, 'image', 'logo.png');
        const logoData = fs.readFileSync(logoPath);
        const logoBase64 = logoData.toString('base64');
        const logoSrc = `data:image/png;base64,${logoBase64}`;

        const receiverDetails = await UserDetails.findOne({ user_id: req.user }).lean();

        const receiverEmail = receiverDetails.email;
        const receiverPhone = receiverDetails.phoneNumber;
        const receiverName = `${receiverDetails.firstName} ${receiverDetails.lastName}`;
        
        const url =`https://vitalblood.netlify.app/feed`

        const html = `
       <html>
      <head>
        <style>
          h1 {
            color: #A30000;
          }
          h2{
            color: #A30000;
          }
          h6 {
            color: #A30000;
          }
          p {
            font-size: 13px;
            color: #3D3D3D;
            line-height:15px;
          }
          h4{
             color: #3D3D3D;
          }
          .container {
            margin: 20px;
            padding: 20px;
            background-color: #f2f1f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
        <img src="${logoSrc}" alt="Logo" width="100" height="50"/>
         <h1>Save a life</h1>
          <h4>A new donation request has been submitted. Please check your account for details.</h4>
          <br>
          <h2>Donation Request Details:</h2>
          <h3>Patient Details:</h3>
          <p><strong>Full Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
          <p><strong>Case Type:</strong> ${caseType}</p>
          <p><strong>Case Details:</strong> ${caseDetails}</p>
          <p><strong>Blood Type:</strong> ${bloodType}</p>
          <p><strong>Date Needed:</strong> ${dateNeeded}</p>
          <p><strong>Hospital:</strong> ${hospital}</p>
          <p><strong>Level of Emergency:</strong> ${levelOfEmergency}</p>
          <p><strong>Number of Units:</strong> ${numberOfUnits}</p>
          <p>${url}</p>
          <br>
          <h2>Receiver's Details:</h2>
          <p><strong>Email:</strong> ${receiverEmail}</p>
          <p><strong>Phone:</strong> ${receiverPhone}</p>
          <p><strong>Name:</strong> ${receiverName}</p>
          <h6>&copy; 2023 Vital Blood. All rights reserved.</h6>
        </div>
      </body>
      </html>
    `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vital.blood.donation@gmail.com',
                pass: 'gqxjxatnuitwtgjw'
            }
        });

        // Send an email to all users
        const users = await UserDetails.find().lean();
        // const userEmails = users.map((user) => user.email);
        // userEmails.join(', ')
        const mailOptions = {
            from: 'vital.blood.donation@gmail.com',
            to: '',
            bcc: 'maya.atiah.99@gmail.com',
            subject: 'New Donation Request',
            html: html,
        };

        await transporter.sendMail(mailOptions);

     
        
        const notification = new Notification({
            donation_id: donationRequest._id,
            title: `New Donation Request`,
            message: `A new donation request has been placed by ${receiverName}. Please check your account for details.`
        })

        await notification.save()

        const otherUsers = users.filter((item) => item.user_id != receiverDetails.user_id)
        
        const notificationUsers = otherUsers.map((user) => ({
            notification_id: notification._id,
            user_id: user.user_id
        }))

        await NotificationUser.insertMany(notificationUsers);

        return res.json(donationRequest);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



///***PLace a Donation */
exports.createBloodDonation = async (req, res) => {
    try {

        const { firstName, lastName, dateOfBirth, bloodType, hospital, phoneNumber, dateNeeded } = req.body;

        const donation = new Donation({
            donor_id: req.user,
            status: 'pending',
            type: 'donate',
            details: {
                purpose: 'bloodDonation',
                patientInfo: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    phoneNumber

                },
                bloodRequest: {
                    bloodType,
                    hospital,
                    dateNeeded
                },
            },
        });

        await donation.save();
5
21.

        return res.json(donation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

////***Donate a request and inform the receiver to accept *///
exports.requestToDonate = async (req, res) => {
    try {
        const { donationRequestId } = req.params;
        const donorId = req.user;

        // Check if the donation request exists
        const donationRequest = await Donation.findOne({
            _id: donationRequestId,
            type: 'request',
        });

        if (!donationRequest) {
            return res.status(404).json({ message: 'Donation request not found' });
        }

        // Check if the donor has already requested to donate for this request
        const existingRequest = await RequestToDonate.findOne({
            donor_id: donorId,
            donationRequest_id: donationRequestId,
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'You had already requested to donate for this request',
            });
        }

        // Create a new request to donate
        const requestToDonate = new RequestToDonate({
            donor_id: donorId,
            receiver_id: donationRequest.receiver_id,
            donationRequest_id: donationRequestId,
        });


        await requestToDonate.save();

        // Update the donation request's request_id array with the new request's ID
        donationRequest.request_id.push(requestToDonate._id);


        await donationRequest.save();

        // Set the 'disabled' field to indicate that the donor has not donated to this request
        const modifiedRequestToDonate = requestToDonate.toObject();
        modifiedRequestToDonate.disabled = false;

        const receiverDetails = await UserDetails.findOne({ user_id: donationRequest.receiver_id }).lean();
        const donorDetails = await UserDetails.findOne({ user_id: donorId }).lean();


        const donorEmail = donorDetails.email;
        const donorsPhone = donorDetails.phoneNumber;

        const url =`https://vitalblood.netlify.app/userProfile`
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vital.blood.donation@gmail.com',
                pass: 'gqxjxatnuitwtgjw',
            },
        });

        const logoPath = path.join(__dirname, 'image', 'logo.png');
        const logoData = fs.readFileSync(logoPath);
        const logoBase64 = logoData.toString('base64');
        const logoSrc = `data:image/png;base64,${logoBase64}`;

        const mailOptions = {
            from: 'vital.blood.donation@gmail.com',
            to: receiverDetails.email,
            subject: 'Confirmation of Donation Request',
            html: `<div style="font-family: Arial, sans-serif; font-size: 16px;">
          <h1 style="color: #A30000;">Save a life</h1>
          <img src="${logoSrc}" alt="Logo" width="100" height="50" style="margin-bottom: 20px;">
          <p style="color: #333; margin-bottom: 20px;">
              Dear ${receiverDetails.firstName},
          </p>
          <p style="color: #333; margin-bottom: 10px;">
              I am writing to confirm my request to donate for your blood donation request. Please let me know the details and arrangements for the donation.
          </p>
          <p>${url}</p>
          <h4 style="color: #A3000;">Contact me </h4>
          <p>Email: ${donorEmail} <br>Phone Number: ${donorsPhone}
          </p>
          <p style="color: #333;">
              Thank you.
          </p>
          <p style="color: #333;">
              Sincerely,
              <br>
              ${donorDetails.firstName} ${donorDetails.lastName}
          </p>
      </div>`,
        };

        await transporter.sendMail(mailOptions);

        const notification = new Notification({
            donation_id: donationRequestId,
            title: 'Donation Request',
            message: `${donorDetails.firstName} ${donorDetails.lastName} requested to donate` 
        })
  
        await notification.save()

        const notificatioId = notification._id

        const notificationUser = new NotificationUser({
            notification_id: notificatioId,
            user_id: donationRequest.receiver_id
        })

        await notificationUser.save()

        return res.json(modifiedRequestToDonate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};






///***Accept donation request ***/////
exports.acceptDonationRequest = async (req, res) => {
    try {
        const { donationRequestId } = req.params;
        const receiverId = req.user;
        const { requestId, status } = req.body;

        // Find the donation request
        const donationRequest = await Donation.findById(donationRequestId);

        if (!donationRequest || donationRequest.type !== 'request') {
            return res.status(404).json({ message: 'Donation request not found' });
        }

        // Find the request to donate
        const requestToDonate = await RequestToDonate.findById(requestId);

        if (!requestToDonate) {
            return res.status(404).json({ message: 'Request to donate not found' });
        }

        // Verify that the request is associated with the donation request and receiver
        if (
            !donationRequest.request_id.includes(requestToDonate._id) &&
            requestToDonate.receiver_id.toString() !== receiverId
        ) {
            return res.status(400).json({ message: 'Invalid request to donate' });
        }

        // Update the status of the request to donate based on the provided status
        requestToDonate.status = status;

        await requestToDonate.save();

        // Send an email notification to the donor
        const donorDetails = await UserDetails.findOne({ user_id: requestToDonate.donor_id }).lean();
        const receiverDetails = await UserDetails.findOne({ user_id: receiverId }).lean();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vital.blood.donation@gmail.com',
                pass: 'gqxjxatnuitwtgjw'
            }
        });

        const logoPath = path.join(__dirname, 'image', 'logo.png');
        const logoData = fs.readFileSync(logoPath);
        const logoBase64 = logoData.toString('base64');
        const logoSrc = `data:image/png;base64,${logoBase64}`;

        const subject = status === 'accepted' ? 'Donation Request Accepted' : 'Donation Request Rejected';

        const mailOptions = {
            from: receiverDetails.email,
            to: donorDetails.email,
            subject: subject,
            html: `<div style="font-family: Arial, sans-serif; font-size: 16px;">
                <h1 style="color: #A30000;">Save a life</h1>
                <img src="${logoSrc}" alt="Logo" width="200" height="100" style="margin-bottom: 20px;">
                <p style="color: #333; margin-bottom: 20px;">
                    Dear ${donorDetails.firstName},
                </p>
                <p style="color: #333; margin-bottom: 20px;">
                    Your donation request has been ${status}. Thank you for your willingness to donate.
                </p>
                <p style="color: #333;">
                    Sincerely,
                    <br>
                    ${receiverDetails.firstName} ${receiverDetails.lastName}
                </p>
            </div>`,
        };

        await transporter.sendMail(mailOptions);

        const message = status === 'accepted' ? 'Donation Request Accepted' : 'Donation Request Rejected';

        const notification = new Notification({
            donation_id: donationRequestId,
            title: `${requestToDonate.status}`,
            message:message
        })

        await notification.save();

        const notificatioId = notification._id
        
        const notificationUser = new NotificationUser({
            notification_id: notificatioId,
            user_id: requestToDonate.donor_id
        })
        
        await notificationUser.save()

        return res.json(requestToDonate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};







////***GEt all donations *////
exports.getAllDonationRequests = async (req, res) => {
    try {
        const donationRequests = await Donation.find({ type: 'request', status: 'pending' })
            .populate('request_id')
            .populate({
                path: 'receiver_id',
                populate: {
                    path: 'details_id',
                    model: 'UserDetails'
                }
            });
        return res.json(donationRequests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


//***** Get donations by a specific user***/////

exports.getDonationsByUser = async (req, res) => {
    try {
        const userId = req.user;
        const donations = await Donation.find({
            $or: [{ donor_id: userId }, { receiver_id: userId }],
        })
            .populate({
                path: 'request_id',
                populate: [
                    { path: 'donor_id', populate: { path: 'details_id' } },
                    { path: 'receiver_id', populate: { path: 'details_id' } }
                ]
            })
            .exec();

        return res.json(donations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
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
        return res.status(500).json({ message: error.message });
    }
};


// Delete Donation by ID
exports.deleteDonationById = async (req, res) => {
    try {
        const userId = req.user;
        const donationId = req.params.donationId;

        // Find the donation to check if the user has permission to delete it
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }


        const notifications = await Notification.find({ donation_id: donationId })
        
        const notificationId = notifications.map(notification => notification._id)
        // Check if the user is the donor or receiver of the donation
        // if (
        //     donation.donor_id.toString() !== userId &&
        //     donation.receiver_id.toString() !== userId
        // ) {
        //     return res.status(403).json({ message: 'User does not have permission to delete this donation' });
        // }

        // Delete the donation and the associated RequestToDonate documents
        await Donation.findByIdAndDelete(donationId);
        await RequestToDonate.deleteMany({ donationRequest_id: donationId });

        await Notification.deleteMany({ donation_id: donationId });
        await NotificationUser.deleteMany({ notification_id: { $in: notificationId } });

        return res.json({ message: 'Donation and associated RequestToDonate deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

