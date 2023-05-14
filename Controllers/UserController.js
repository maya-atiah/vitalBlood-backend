const User = require('../Models/UserModel')
const UserDetails = require('../Models/UserDetailsModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


///********Register */
exports.register = async (req, res) => {

    const { firstName,
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
        type } = req.body;

    let image;
    if (req.file) {
        image = req.file.filename;
    }
    // const basePath = `${req.protocol}://${req.get("host")}/images`;
    //   const Image= req.files.map((file) => `${basePath}/${file.filename}`);


    if (!firstName || !lastName || !password || !phoneNumber || !location || !marital_status || !gender || !id_number || !blood_type || !nationality || !emergency_number) {
        return res.status(422).send({ message: "Please fill in all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(422).send({ message: "Please enter a valid email address" });
    }

    const userExists = await UserDetails.findOne({ email })
    //    return  res.status(200).send(userExists)

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
        is_deleted: false
    });



    await userDetails.save();

    const user = await User({
        details_id: userDetails._id,
        type
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    if (user) {
        res.status(201).json({
            _id: user.id,
            firstName: user.firstName,
            email: user.email,
            token: token
        });
    }


}



///******Login */
exports.login = async (req, res) => {

    const { email, password } = req.body;

    // console.log('body',req.body)

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

        const token = jwt.sign({ userId: userDetails.user_id }, process.env.JWT_SECRET);

        res.status(200).json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
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
    const userId = req.params.userId
    try {
        const user = await User.findById(userId).populate('details_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const userDetails = await UserDetails.findById(user.details_id)

        res.status(500).json({ user })

    } catch (error) {
        res.status(500).json({ message: 'Error' })
    }
}


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

        const userId = req.params.userId;
        const user = await User.findById(userId);
        const userDetails = await UserDetails.findById(user.details_id);


        if (!user || !userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }


        const basePath = `${req.protocol}://${req.get("host")}/images`;
        let image;
        if (req.file) {
            image = req.file.filename;
        }

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
        userDetails.image = `${basePath}/${image}`;

        await userDetails.save();

        return res.json(userDetails);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}
