import dotenv from 'dotenv';
dotenv.config();
export const config = {
  signit: {
    apiUrl: 'https://api-sandbox.signit.sa/v1',
    clientId: process.env.SIGNIT_CLIENT_ID || '',
    clientSecret: process.env.SIGNIT_CLIENT_SECRET || '',
  },
};
