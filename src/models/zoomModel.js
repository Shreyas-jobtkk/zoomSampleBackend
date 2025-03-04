import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accountId = process.env.ACCOUNT_ID;

// Encode client ID and client secret in Base64
const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64"
);

// Headers for OAuth request
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  Authorization: `Basic ${encodedCredentials}`,
};

// Function to get Zoom API access token
export async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      new URLSearchParams({
        grant_type: "account_credentials",
        account_id: accountId,
      }),
      { headers }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response?.data || error
    );
    throw new Error("Failed to get access token");
  }
}

// Function to create a Zoom meeting
export async function createMeeting() {
  try {
    const ACCESS_TOKEN = await getAccessToken(); // Get fresh access token
    const url = `https://api.zoom.us/v2/users/me/meetings`;

    const meetingData = {
      topic: "Sample Meeting",
      type: 1, // Instant Meeting
      duration: 30,
      agenda: "Discuss project updates",
    };

    const response = await axios.post(url, meetingData, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(144, response.data);

    return { id: response.data.id, password: response.data.password };
  } catch (error) {
    console.error("Error creating meeting:", error.response?.data || error);
    throw new Error("Failed to create Zoom meeting");
  }
}
