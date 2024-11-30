const Flutterwave = require('flutterwave-node-v3');

// const publicKey = process.env.PUBLIC_KEY!;
// const secretKey = process.env.SECRET_KEY!;
// const encryptionKey = process.env.ENCRYPTION_KEY!;

// // Initialize Flutterwave with the keys
// const flw = new Flutterwave(publicKey, secretKey);

// // Export the configuration
// export { flw, publicKey, secretKey, encryptionKey };

// const flw = new Flutterwave({
//     public_key: process.env.PUBLIC_KEY || '',  // Load from .env
//     secret_key: process.env.SECRET_KEY || '',  // Load from .env
//     encryption_key: process.env.ENCRYPTION_KEY || '',  // Load from .env
// });

const flw = new Flutterwave(String(process.env.FLUTTERWAVE_PUBLIC_KEY), String(process.env.FLUTTERWAVE_SECRET_KEY));

export { flw };