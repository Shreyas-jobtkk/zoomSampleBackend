import express from 'express';
import fetch from 'node-fetch'; // or axios if you're using axios for the fetch
import axios from 'axios';
const router = express.Router();
import dotenv from 'dotenv'

dotenv.config()

// // Your credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accountId = process.env.ACCOUNT_ID;

// Encode client ID and client secret in Base64
const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

// Set up headers for the request
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${encodedCredentials}`
};

let ACCESS_TOKEN;

// Set up the body of the access token request
const body = new URLSearchParams({
    grant_type: 'account_credentials',
    account_id: accountId // Ensure accountId is defined
});

// Function to get access token from Zoom API
async function getAccessToken() {
    try {
        const response = await fetch('https://zoom.us/oauth/token', {
            method: 'POST',
            headers: headers, // Ensure headers is defined
            body: body
        });

        // Check if response is OK (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        ACCESS_TOKEN = data.access_token;
        // Log the access token and its type
        // console.log('Access Token:', data.access_token);
        // console.log('Token Type:', data.token_type);
        // console.log('Expires In:', data.expires_in); // This is usually 3600 seconds (1 hour)
        // console.log('Scope:', data.scope);
        // console.log('data:', data);
    } catch (error) {
        console.error('Error fetching access token:', error);
    }
}

export async function createMeeting() {

    console.log(155)
    // Call the function to get the access token
    await getAccessToken(); // Wait for the access token to be set

    const url = `https://api.zoom.us/v2/users/me/meetings`;

    const meetingData = {
        topic: 'Sample Meeting',
        type: 1, // Instant Meeting
        duration: 30, // Duration in minutes
        agenda: 'Discuss project updates',
    };

    try {
        const response = await axios.post(url, meetingData, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Meeting start_url:', response.data.start_url);
        console.log('Meeting join_url:', response.data.join_url);

        const startUrl = response.data.start_url;
        const joinUrl = response.data.join_url;

        return {
            start_url: startUrl,
            join_url: joinUrl,
        };

        // io.emit('url', joinUrl);
        // io.emit('startUrl', startUrl);

        // // Route to get the URL data
        // app.get('/api/url', (req, res) => {
        //   res.json({
        //     start_url: startUrl,
        //     join_url: joinUrl
        //   });
        // });


    } catch (error) {
        console.error('Error creating meeting:', error.response ? error.response.data : error.message);
    }
}

// Define the route for creating a meeting
router.post('/create-meeting', createMeeting);

export default router;