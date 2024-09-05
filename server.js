const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');
const app = express();
const port = 3000;

// Replace these with your actual Twilio credentials
const accountSid = 'AC55eacf7dd30f6739eb5e5ca5b258d36f'; 
const authToken = '510b2d3ef2b6be7ce62fee8085ccb1c2'; 
const twilioPhoneNumber = '+1 862 437 4960'; // e.g., '+18624374960'

const client = twilio(accountSid, authToken);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

let otpCode = '';
let userPhoneNumber = '';

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  // Basic validation
  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }

  // Generate a 6-digit OTP
  otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  userPhoneNumber = phoneNumber;
  console.log(`Generated OTP for ${userPhoneNumber}: ${otpCode}`);

  // Send OTP via Twilio
  client.messages.create({
    body: `Your OTP code is ${otpCode}`,
    from: twilioPhoneNumber,
    to: userPhoneNumber
  })
  .then(message => {
    console.log(`OTP sent: ${message.sid}`);
    res.json({ success: true, message: 'OTP sent successfully.' });
  })
  .catch(error => {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again later.' });
  });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  // Basic validation
  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required.' });
  }

  console.log(`Received OTP: ${otp}`);
  console.log(`Stored OTP: ${otpCode}`);

  if (otp === otpCode) {
    res.json({ success: true, message: 'OTP verified successfully.' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }
});

// Serve success.html upon successful verification
app.get('/success.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/success.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


