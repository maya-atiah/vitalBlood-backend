const User = require('../Models/UserModel')
const UserDetails = require('../Models/UserDetailsModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");


//Initialize a firebase application
// initializeApp(config.firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// // Setting up multer as a middleware to grab photo uploads
// const upload = multer({ storage: multer.memoryStorage() });

///********Register */
exports.register = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        location,
        marital_status,
        gender,
        id_number,
        blood_type,
        nationality,
        emergency_number,
        type
    } = req.body;

    let image;
    if (req.file) {
        image = req.file.filename;
    }

    // if (
    //     !firstName ||
    //     !lastName ||
    //     !password ||
    //     !phoneNumber ||
    //     !location ||
    //     !marital_status ||
    //     !gender ||
    //     !id_number ||
    //     !blood_type ||
    //     !nationality ||
    //     !emergency_number
    // ) {
    //     return res.status(422).send({ message: "Please fill in all required fields" });
    // }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(422).send({ message: "Please enter a valid email address" });
    }

    const userExists = await UserDetails.findOne({ email });

    if (userExists) {
        return res.status(422).send({ message: "User with that email address already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = new UserDetails({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        location,
        image: image?.filename,
        marital_status,
        gender,
        id_number,
        blood_type,
        nationality,
        emergency_number,
        is_deleted: false,
        user_id: null
    });

    await userDetails.save();

    const user = new User({
        details_id: userDetails._id,
        type
    });

    await user.save();

    // Update the user_id in the UserDetails model
    userDetails.user_id = user._id;
    await userDetails.save();

    const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET);

    if (user) {
        res.status(201).json({
            _id: user.id,
            firstName: user.firstName,
            email: user.email,
            token: token
        });
    }
};



///******Login */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const userDetails = await UserDetails.findOne({ email });

        if (!userDetails) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const isPasswordMatch = await bcrypt.compare(password, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: userDetails.user_id }, process.env.ACCESS_TOKEN_SECRET);

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};




// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET);
};

///***Users */
exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find().populate('details_id');

        res.status(200).json({ users });

    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};



///*****Get User by id */
exports.getUserbyid = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await User.findById(userId).populate('details_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDetails = await UserDetails.findById(user.details_id).lean();
        console.log(user);
        const userWithDetails = {
            ...user.toObject(),
            details: userDetails
        };
        res.status(200).json(userWithDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};


exports.deleteUserById = async (req, res) => {
    const userId = req.params.userId;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const userDetails = await UserDetails.findById(user.details_id);
        if (!userDetails) {
            return res.status(500).json({ message: 'Something went wrong' });
        }


        await userDetails.deleteOne();


        await user.deleteOne();

        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};



///****update user profile */
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user;
       
        const user = await User.findById(userId);
        const userDetails = await UserDetails.findById(user.details_id);
        if (!user || !userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }
  console.log(req.file)
        const image = await uploadImage(req.file);
        
        const imageURL = image.downloadURL;
     
        userDetails.firstName = req.body.firstName || userDetails.firstName;
        userDetails.lastName = req.body.lastName || userDetails.lastName;
        userDetails.email = req.body.email || userDetails.email;
        userDetails.phoneNumber = req.body.phoneNumber || userDetails.phoneNumber;
        userDetails.location = req.body.location || userDetails.location;
        userDetails.marital_status = req.body.marital_status || userDetails.marital_status;
        userDetails.gender = req.body.gender || userDetails.gender;
        userDetails.id_number = req.body.id_number || userDetails.id_number;
        userDetails.blood_type = req.body.blood_type || userDetails.blood_type;
        userDetails.nationality = req.body.nationality || userDetails.nationality;
        userDetails.emergency_number = req.body.emergency_number || userDetails.emergency_number;
        userDetails.image = imageURL;

        await userDetails.save();

        return res.json(userDetails);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const uploadImage = async (file) => {

    const dateTime = giveCurrentDateTime();

    const storageRef = ref(storage, `files/${file.originalname + "       " + dateTime}`);

    // Create file metadata including the content type
    const metadata = {
        contentType: file.mimetype,
    };

    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);

   
    return {
        message: 'file uploaded to firebase storage',
        name: file.originalname,
        type: file.mimetype,
        downloadURL: downloadURL
    }

}



const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}





