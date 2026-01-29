const axios = require('axios');
const qs = require('querystring');

class ZoomService {
    constructor() {
        this.clientId = process.env.ZOOM_CLIENT_ID;
        this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
        this.accountId = process.env.ZOOM_ACCOUNT_ID;
        this.accessToken = null;
        this.tokenExpiresAt = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post(
                `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
                {},
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
            return this.accessToken;
        } catch (error) {
            console.error('Zoom Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Zoom');
        }
    }

    async createMeeting(topic, startTime, duration = 60) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                {
                    topic,
                    type: 2, // Scheduled meeting
                    start_time: startTime,
                    duration,
                    settings: {
                        join_before_host: true,
                        mute_upon_entry: true,
                        waiting_room: false,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                id: response.data.id,
                joinUrl: response.data.join_url,
                startUrl: response.data.start_url,
                password: response.data.password,
            };
        } catch (error) {
            console.error('Zoom Create Meeting Error:', error.response?.data || error.message);
            throw new Error('Failed to create Zoom meeting');
        }
    }
}

module.exports = new ZoomService();
