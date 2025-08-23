require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('Type:', typeof process.env.DATABASE_URL);
