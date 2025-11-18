import jwt from "jsonwebtoken";
import { userModel } from "../models/user.schema.js";
import bcrypt from "bcryptjs";
import Constants from "../constant.js";
import sendMail from "../utilities/email.send.js";

const signUp = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ status: "Failed", message: "All Fields Required" });
        }
        if (typeof password !== "string") {
            password = String(password);
        }

        const duplicateEmail = await userModel.findOne({ email });
        if (duplicateEmail) {
            return res
                .status(409)
                .json({ status: "Failed", message: "Email already in use" });
        }
        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);
        let adduser = new userModel({
            name: name,
            email: email,
            password: hashPassword,
        });
        await adduser.save();

        let payload = {
            user: {
                id: adduser._id,
            },
        };
        let token = jwt.sign(payload, Constants.SECRET_KEY, { expiresIn: "1y" });
        adduser.token = token;
        await adduser.save();

        res
            .status(201)
            .json({
                message: "User Created Successfully",
                status: "success",
                data: adduser,
            });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ status: "Failed", message: "Internal Server Error" });
    }
};

const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ status: "Failed", message: "All Fields Required" });
        }
        if (typeof password !== "string") {
            password = String(password);
        }

        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res
                .status(409)
                .json({ status: "Failed", message: "User Can not find" });
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ status: "Failed", message: "Password is in correct" });
        }
        let payload = {
            user: {
                id: userExist._id,
            },
        };
        let token = jwt.sign(payload, Constants.SECRET_KEY, { expiresIn: "1y" });
        userExist.token = token;
        await userExist.save();

        res
            .status(201)
            .json({
                message: "User Login Successfully",
                status: "success",
                data: userExist,
            });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ status: "Failed", message: "Internal Server Error" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ status: "Failed", message: "All Fields Required" });
        }

        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res
                .status(409)
                .json({ status: "Failed", message: "User Can not find" });
        }

        const OTP = Math.floor(Math.random() * 900000 + 100000);

        const mailResponse = await sendMail({
            email: [email],
            subject: "For Verification OTP",
            html: `<h1>Please verify OTP and teh OTP is ${OTP}</h1>`
        })

        if (!mailResponse) {
            return res.status(500).json({ status: "Failed", message: "Please try agaain letter" });
        }

        userExist.otp = {
            value: OTP.toString(),
            expireAt: new Date(Date.now() + 1000 * 60 * 10),
            verified: false,
        }

        await userExist.save()
        res.status(200).json({ status: "success", message: "OTP send successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Failed", message: "Internal Server Error" });
    }
};

const validateOTP = async (req, res) => {
     try {
        let { email, otp } = req.body;
        if (!email || !otp) {
            return res
                .status(400)
                .json({ status: "Failed", message: "All Fields Required" });
        }

        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res
                .status(409)
                .json({ status: "Failed", message: "User Can not find" });
        }

        if(userExist.otp.value !== otp.toString()) {
            return res.status(400).json({ status: "Failed", message: "OTP is wrong" });
        }

        let time = new Date();
        if (time > userExist.otp.expireAt) {
            return res.status(400).json({ status: "Failed", message: "OTP is Expired" });
        }

        userExist.otp.validation = true;
        await userExist.save()

        res.status(200).json({ status: "Success", message: "OTP varified" });


    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
}

const resetPassword = async (req, res) => {
     try {
        let { email, password} = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ status: "Failed", message: "All Fields Required" });
        }

        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res
                .status(409)
                .json({ status: "Failed", message: "User Can not find" });
        }

        if (!userExist.otp.validation) {
             return res
                .status(401)
                .json({ status: "Failed", message: "User is not validated" });
        }

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);

        userExist.password = hashPassword;
        userExist.otp.validation = false;
        await userExist.save();

        let payload = {
            user: {
                id: userExist._id,
            },
        };
        let token = jwt.sign(payload, Constants.SECRET_KEY, { expiresIn: "1y" });
        userExist.token = token;
        await userExist.save();

        res.status(200).json({ status: "success", message: "Password Update Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Failed", message: "Internal Server Error" });
    }
}

const getUsers = async (req, res) => {
    try {
        let users = await userModel.find();
        res.status(200).json({status: "success", message: "User Fetch Successfully", data: users})
    } catch (error) {
        console.log(error);
        res.status(500).json({status: "failed", message: "Internal Server Error"})        
    }
}

const AuthWithGoogle = async (req, res) => {
    try {
        let payload = {
            user: {
                id: req.user._id,
            },
        };
        let token = jwt.sign(payload, Constants.SECRET_KEY, { expiresIn: "1y" });
        let user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({status: "failed", message: "User does not found"});
        }
        user.token = token;
        await user.save()
        res.redirect(`${Constants.CLIENT_URL}/auth-success?token=${token}`)
    } catch (error) {
        console.log(error);
        res.redirect(`${Constants.CLIENT_URL}/login?error=google_failed`)
    }
}

const getMyProfile = (req, res) => {
    try {
        let user = req.user;
        res.status(200).json({status: "success", message: "User fetch successfully", data: user});
    } catch (error) {
        console.log(error);
        res.status(500).json({status: "failed", message: "Internal Server Error"})
    }
}

export { signUp, login, forgotPassword, validateOTP, resetPassword, getUsers, AuthWithGoogle, getMyProfile };