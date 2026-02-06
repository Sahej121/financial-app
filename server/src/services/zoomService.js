const axios = require('axios');
const winston = require('winston');

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get Zoom Server-to-Server OAuth Token
 */
const getAccessToken = async () => {
    // If token is cached and not expired (with 5 min buffer), return it
    if (cachedToken && Date.now() < tokenExpiresAt - 300000) {
        return cachedToken;
    }

    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        winston.warn('Zoom credentials missing. Zoom integration will fail.');
        return null;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
            {},
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        cachedToken = response.data.access_token;
        // Expires in is usually 3600 seconds (1 hour)
        tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

        winston.info('Zoom Access Token refreshed');
        return cachedToken;
    } catch (error) {
        winston.error('Error fetching Zoom access token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Zoom');
    }
};

/**
 * Create a Zoom Meeting
 * @param {string} topic - Meeting topic
 * @param {string} startTime - ISO String start time
 * @param {number} duration - Duration in minutes
 * @param {string} agenda - Meeting description
 */
const createMeeting = async (topic, startTime, duration = 60, agenda = '') => {
    try {
        const token = await getAccessToken();
        if (!token) throw new Error('No Zoom Access Token available');

        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic,
                type: 2, // Scheduled meeting
                start_time: startTime,
                duration,
                timezone: 'Asia/Kolkata', // Hardcoded for now, ideal to pass or config
                agenda,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    waiting_room: true,
                    auto_recording: 'cloud',
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        winston.info(`Zoom Meeting created: ${response.data.join_url}`);
        return {
            id: response.data.id,
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password,
        };
    } catch (error) {
        winston.error('Error creating Zoom meeting:', error.response?.data || error.message);
        // Fallback: Return null or throw, depending on strictness.
        // For now, let's allow it to fail gracefully so the booking can still happen (maybe manual link later)
        throw new Error('Zoom meeting creation failed');
    }
};

module.exports = {
    createMeeting,
};
