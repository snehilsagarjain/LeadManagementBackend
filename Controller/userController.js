const moment = require('moment/moment.js');
const UserModel = require('../Models/UserModel.js');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');

exports.createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { FullName, Email, Password, Role } = req.body;
        if (!(FullName && Email && Password)) { return res.status(404).json({ message: "Name, Email and Password fields are Mandatory." }) }
        console.log(UserModel);
        const userEmail = await UserModel.findOne({ email: Email })
        console.log(userEmail);
        if (userEmail) { return res.status(400).json({ message: "email already exist" }) }

        const salt = bcrypt.genSaltSync(10);
        console.log(`>>>>>>>>>salt>>>>>`, salt);
        const hash = bcrypt.hashSync(Password, salt);
        console.log(`>>>>>>>hash>>>>`, hash);

        console.log(Role);

        let data;
        if (!Role) { data = { name: FullName, email: Email, password: hash } }
        else { data = { name: FullName, email: Email, password: hash, role: "Admin" } }
        console.log(`>>>>>>>>data>>>>>`, data);
        if (!data) { return res.status(404).json({ message: 'no data' }) }
        const users = new UserModel(data);
        console.log(`>>>>>>>>user>>>>>>`, users)
        if (!users) { return res.status(404).json({ message: 'user data not received' }) }

        await users.save();
        res.status(200).json(users);
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error" })
    }

}

exports.UpdateUser = async (req, res) => {
    const { id, newpassword } = req.body
    // const data = req.body

    const salt = bcrypt.genSaltSync(10);
    console.log(`>>>>>>>>>salt>>>>>`, salt);
    const hash = bcrypt.hashSync(newpassword, salt);
    console.log(`>>>>>>>hash>>>>`, hash);

    console.log('75', id)
    console.log('password' + newpassword + "  ,,  " + 'password' + hash);
    if (!id) { return res.status(404).json({ error: "ID IS REQUIRED!!!" }) }
    const user = await UserModel.findByIdAndUpdate(id, { 'password': hash })
    if (!user) { return res.status(404).json({ error: "record not found" }); }
    res.status(200).json(user)
}

exports.UpdateUserInfo = async (req, res) => {
    const { id } = req.params;
    const data = req.body
    console.log(id)

    if (!id) { return res.status(404).json({ error: "ID IS REQUIRED!!!" }) }
    const newEncryptedPassword = (
        typeof req.body.password === 'object' &&
        req.body.password.value
    )
        ? req.body.password.value
        : req.body.password;
    data.password = newEncryptedPassword;
    const user = await UserModel.findByIdAndUpdate(id, data)
    if (!user) { return res.status(404).json({ error: "record not found" }); }
    res.status(200).json(user)
}

exports.createMail = async (to, subject, message) => {
    try {
        console.log("createMail");
        // const { to, subject, message } = req.body;

        //validation
        // if (!(to && subject && message)) {
        //     res.status(400).json({ message: "All fields required !!" })
        // }

        const transporter = nodeMailer.createTransport({
            //SMTP: "Gmail",
            port: 465,
            host: "smtp.gmail.com",
            // port: 587,
            auth: {
                user: "snehilsagarjain@gmail.com",
                pass: "jdqr hzmn ttsb fvye"
            }
        })
        console.log(`>>>>>>>>>transporter`, transporter);

        // "asdfghjkllasdfghjkl
        const data = { to, subject, text: message };
        console.log(`>>>>>>>>>data`, data);
        const result = await transporter.sendMail(data)
        console.log(`>>>>>>>>>result`, result);
        return result;
        // res.status(200).json({ message: "Mail send successfully", success: true, data: message, result })
    }
    catch (error) {
        console.log(error)
    }
}
const generateOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}
exports.forgetPassword = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const userEmail = await UserModel.findOne({ email })
    console.log(`>>>>>>>>106>>>>>>>userEmail`, userEmail);
    if (!userEmail) { return res.status(400).json({ message: "email doen't exist" }) }

    const randomOtp = await generateOtp(); console.log(randomOtp);
    const subject = 'otp verification';
    const message = `Otp: ${randomOtp}.\nThis otp is valid upto 5 Minutes.`;
    console.log(message);

    const expirytime = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    console.log(expirytime);

    const result = await this.createMail(email, message, subject);
    const output = { randomOtp, expirytime };
    if (result) res.status(200).json(output);
}

exports.getAllUsers = async (req, res) => {
    console.log(`>>>>>>>>>11`);

    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        console.log("176");
        const users = await UserModel.find({}).sort({ createdAt: -1 });
        console.log(`>>>>>>>>>28>>>users>>>>>>>.`, users);
        console.log("===========================================");

        if (users) { res.status(200).json(users); }
        else res.status(404).json({ message: "users not found" });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
}

exports.softdelete = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(403).json({ message: "Access Denied." });
    const users = await UserModel.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    console.log(`>>>>>>users:`, users); //{ _id: id }, { $set:  }
    res.status(200).json(users);
}
