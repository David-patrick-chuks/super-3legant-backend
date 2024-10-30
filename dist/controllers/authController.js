"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSignIn = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = new User_1.User({ name, email, password: hashedPassword });
    try {
        yield user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error registering user' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield User_1.User.findOne({ email });
    if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
            expiresIn: '1h',
        });
        res.json({ token });
    }
    else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});
exports.login = login;
const googleSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const ticket = yield client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();
    let user = yield User_1.User.findOne({ email });
    if (!user) {
        user = yield User_1.User.create({ email, name, picture });
    }
    const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
        expiresIn: '1h',
    });
    res.status(200).json({ message: 'Login successful', token: jwtToken });
});
exports.googleSignIn = googleSignIn;
