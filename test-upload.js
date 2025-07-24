const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // Test file (create a simple test image)
        const testImagePath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(testImagePath, 'test image content');
        
        // Get a valid token from localStorage (we'll need to extract this from browser)
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'; // This would need to be a real token
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testImagePath));
        
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Upload successful:', response.data);
        
    } catch (error) {
        console.error('Upload failed:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
    }
}

testUpload();