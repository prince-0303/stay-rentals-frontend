const axios = require('axios');

async function testAuth() {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    try {
        console.log('Registering...');
        const regRes = await axios.post('http://localhost:5173/api/auth/register/', {
            email,
            password,
            password_confirm: password,
            first_name: 'Test',
            last_name: 'User',
            role: 'user'
        });
        console.log('Register Response:', JSON.stringify(regRes.data, null, 2));
    } catch (e) {
        console.log('Register Error:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }

    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5173/api/auth/login/', {
            email,
            password
        });
        console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
    } catch (e) {
        console.log('Login Error:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}

testAuth();
