import fetch from 'node-fetch';

const INGESTION_URL = 'http://localhost:5001/api/v1/analytics/track';

const EVENT_TYPES = ['page_view', 'click_button', 'add_to_cart', 'purchase_success', 'checkout_error'];
const USER_IDS = ['debo_23JE095', 'alex_45', 'rahul_99', 'priya_v', 'sam_007', 'guest_user'];
const BROWSERS = ['chrome', 'firefox', 'safari', 'edge'];

console.log('🚀 [Mock Data Generator] Started simulating real-time user traffic...');

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function sendMockEvent() {
    const payload = {
        eventType: getRandom(EVENT_TYPES),
        userId: getRandom(USER_IDS),
        metadata: {
            browser: getRandom(BROWSERS),
            timestamp: new Date().toISOString(),
            screen_resolution: '1920x1080'
        }
    };

    try {
        const response = await fetch(INGESTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log(`🚀 [Sent] ${payload.eventType} | User: ${payload.userId}`);
        } else {
            console.error(`❌ [Failed] Status: ${response.status}`);
        }
    } catch (error) {
        console.error('⚠️ [Error] Connection to ingestion-service failed. Is backend running?');
    }
}

setInterval(sendMockEvent, 2500);