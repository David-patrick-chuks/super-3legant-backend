"use strict";
// import { User } from '../models/User';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// export const registerUser = async (name: string, email: string, password: string) => {
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = new User({ name, email, password: hashedPassword });
//   try {
//     await user.save();
//     return { message: 'User registered successfully' };
//   } catch (error) {
//     throw new Error('Error registering user');
//   }
// };
// export const loginUser = async (email: string, password: string) => {
//   const user = await User.findOne({ email });
//   if (user && (await bcrypt.compare(password, user.password))) {
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
//       expiresIn: '1h',
//     });
//     return { token };
//   } else {
//     throw new Error('Invalid email or password');
//   }
// };
// export const verifyToken = (token: string) => {
//   return jwt.verify(token, process.env.JWT_SECRET || '');
// };
