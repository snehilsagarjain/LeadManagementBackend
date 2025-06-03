const userModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

exports.userLogin = async (req, res) => {
    const { Email, Password } = req.body
    console.log(req.body);
    const userEmail = await userModel.findOne({ email: Email })
    if (!userEmail) { return res.status(400).json({ message: "please Signup" }) }
    else { console.log(userEmail); }
    const databasePassword = userEmail.password
    console.log(Password)
    console.log(databasePassword)
    const match = await bcrypt.compare(Password, databasePassword);
    if (!match) { return res.status(400).json({ message: "Invalid Password" }) }

    if (userEmail.status != "active") { return res.status(401).json({ message: "LOGIN ACCESS DENIED!!!" }); }
    const token = jwt.sign({ id: userEmail._id }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
    return res.status(200).json({ userEmail, token, message: "userLogin succesfully" });
}

// Function to extract and verify the token
const verifyToken = (req) => {
    return new Promise((resolve, reject) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return reject("No token provided");

        const token = authHeader.split(" ")[1]; // Extract token
        console.log(`>>>>>>> Token: ${token}`);

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { console.log("70authcontroller"); reject("Token expired or invalid"); }
            else resolve(decoded);
        });
    });
};

// Middleware for authentication
exports.userAuth = async (req, res, next) => {
    try {
        // console.log(`>>>>>>58>>>>>>`);

        //      const token = req.headers?.authorization?.split(" ")[1]; // Extract token
        //      console.log(`>>>>>>> Token: ${token}`);
        //      if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = await verifyToken(req);
        console.log(`>>>>>>> Decoded:`, decoded);


        const user = await userModel.findById(decoded.id);
        console.log(`User: `, user);

        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user; // Attach user info to request
        next();
    } catch (error) { return res.status(401).json({ message: error }); }
};

// API endpoint to verify token (for frontend check)
exports.verifyTokenAPI = async (req, res) => {
    try {
        await verifyToken(req);
        return res.status(200).json({ message: "Token is valid" });

    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Token expired or invalid" });
        // return res.status(401).json({ message: error });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
};
