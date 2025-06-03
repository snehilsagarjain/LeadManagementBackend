const jwt = require('jsonwebtoken');
const userModel = require('../Models/UserModel');
const secretKey = 'asdfgghhjklj;ieyyurorpr[knvvm,llnvkvl'
// const secretKey = process.env.JWT_SECRET;
// const userModel = require('../Model/user_model')
//axios.get(api, { headers: {"authorization": `Bearer ${token}` }})
// exports.userAuth = async (req, res, next) => {
//     try {
//         const token = req.headers?.authorization;
//         console.log(`>>>>>>>token>>>>>>>`, token)
//         if (!token) { return res.status(401).json({ message: 'No token provided' }); }
//         const splitToken = token.split(" ")[1];
//         console.log(`>>>>>>>>>splitToken>>>>>>>`, splitToken);

//         const decode = jwt.verify(splitToken, secretKey);
//         console.log(`>>>>>>>>>decode>>>>>>>`, decode);
//         if (!decode) { res.status(401).json({ message: 'Invalid token' }) }
//         const user = await userModel.findById(decode.id); console.log(`user: `, user);
//         req.drdr = user;
//         if (!user) { return res.status(401).json({ message: 'User not found' }); }
//         console.log("22")
//         next();
//     }
//     catch (ex) {
//         res.status(400).send('Invalid token'); //may be when token expires
//     }
// }

// exports.verifyToken = (req, res) => {
//     const token = req.headers.authorization?.split(" ")[1]; // Extract token
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(401).json({ message: "Token expired or invalid" });
//         res.status(200).json({ message: "Token is valid" });
//     });
// };

// Function to extract and verify the token
const verifyToken = (req) => {
    return new Promise((resolve, reject) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return reject("No token provided");

        const token = authHeader.split(" ")[1]; // Extract token
        console.log(`>>>>>>> Token: ${token}`);

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) reject("Token expired or invalid");
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
