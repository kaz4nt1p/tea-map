import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Photo Upload and Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Handle authentication if needed
    try {
      // Check if we're already on the map page
      const mapElement = await page.locator('#map').first();
      if (await mapElement.isVisible()) {
        console.log('Already on map page');
        return;
      }
    } catch (e) {
      console.log('Not on map page, checking for auth');
    }
    
    // Try to navigate to map
    try {
      await page.goto('http://localhost:3001/map');
      await page.waitForTimeout(2000);
      
      // Check if we need to authenticate
      const authForm = await page.locator('form').first();
      if (await authForm.isVisible()) {
        console.log('Need to authenticate');
        
        // Try to login with test credentials
        await page.fill('input[type="email"]', 'test@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Authentication flow not working, continuing...');
    }
  });

  test('should upload photo and display in preview', async ({ page }) => {
    // Navigate to map page
    await page.goto('http://localhost:3001/map');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/01-initial-map.png' });
    
    // Click on map to open spot creation form
    console.log('Clicking on map to open spot creation form...');
    const mapContainer = await page.locator('.leaflet-container').first();
    await mapContainer.click({ position: { x: 300, y: 300 } });
    await page.waitForTimeout(1000);
    
    // Check if form opened
    const spotForm = await page.locator('form').first();
    const isFormVisible = await spotForm.isVisible();
    console.log('Form visible:', isFormVisible);
    
    if (!isFormVisible) {
      console.log('Form not visible, trying different approach...');
      await page.click('text=Добавить новый спот');
      await page.waitForTimeout(1000);
    }
    
    // Take screenshot after form opens
    await page.screenshot({ path: 'tests/screenshots/02-form-opened.png' });
    
    // Find the file input for image upload
    const fileInput = await page.locator('input[type="file"]').first();
    const isFileInputVisible = await fileInput.isVisible();
    console.log('File input visible:', isFileInputVisible);
    
    if (!isFileInputVisible) {
      // Try to find the upload area
      const uploadArea = await page.locator('text=Нажмите или перетащите фото').first();
      await uploadArea.click();
      await page.waitForTimeout(500);
    }
    
    // Use a test image from the existing uploads
    const testImagePath = path.join(process.cwd(), 'public/uploads/1b8359c1-914a-41c4-8520-b05eb083062a.jpg');
    
    // Upload the image
    console.log('Uploading image...');
    try {
      await fileInput.setInputFiles(testImagePath);
      await page.waitForTimeout(3000); // Wait for upload to complete
      
      // Take screenshot after upload
      await page.screenshot({ path: 'tests/screenshots/03-after-upload.png' });
      
      // Check if preview image appears
      const previewImage = await page.locator('img[alt="preview"]').first();
      const isPreviewVisible = await previewImage.isVisible();
      console.log('Preview image visible:', isPreviewVisible);
      
      if (isPreviewVisible) {
        const previewSrc = await previewImage.getAttribute('src');
        console.log('Preview image src:', previewSrc);
        
        // Verify it's a Cloudinary URL
        if (previewSrc && previewSrc.includes('cloudinary')) {
          console.log('✅ Preview shows Cloudinary URL');
        } else {
          console.log('❌ Preview does not show Cloudinary URL');
        }
      } else {
        console.log('❌ No preview image found');
        
        // Debug: Check what elements are in the form
        const formContent = await page.locator('form').innerHTML();
        console.log('Form content:', formContent);
      }
      
      // Fill in spot details
      await page.fill('input[placeholder*="Например"]', 'Test Photo Spot');
      await page.fill('input[placeholder*="Что особенного"]', 'Testing photo upload');
      await page.fill('textarea[placeholder*="Расскажите больше"]', 'This is a test spot for photo upload functionality');
      
      // Take screenshot before submit
      await page.screenshot({ path: 'tests/screenshots/04-before-submit.png' });
      
      // Submit the form
      console.log('Submitting form...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000); // Wait for submission to complete
      
      // Take screenshot after submit
      await page.screenshot({ path: 'tests/screenshots/05-after-submit.png' });
      
      // Check if spot was created and appears in the list
      const spotList = await page.locator('text=Test Photo Spot').first();
      const isSpotInList = await spotList.isVisible();
      console.log('Spot in list:', isSpotInList);
      
      if (isSpotInList) {
        // Click on the spot to open modal
        console.log('Clicking on spot to open modal...');
        await spotList.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of modal
        await page.screenshot({ path: 'tests/screenshots/06-spot-modal.png' });
        
        // Check if image appears in modal
        const modalImage = await page.locator('.bg-tea-100 img').first();
        const isModalImageVisible = await modalImage.isVisible();
        console.log('Modal image visible:', isModalImageVisible);
        
        if (isModalImageVisible) {
          const modalImageSrc = await modalImage.getAttribute('src');
          console.log('Modal image src:', modalImageSrc);
          
          if (modalImageSrc && modalImageSrc.includes('cloudinary')) {
            console.log('✅ Modal shows Cloudinary image');
          } else {
            console.log('❌ Modal does not show Cloudinary image');
          }
        } else {
          console.log('❌ No image in modal');
        }
      } else {
        console.log('❌ Spot not found in list');
      }
      
    } catch (error) {
      console.error('Error during upload:', error);
      await page.screenshot({ path: 'tests/screenshots/error-upload.png' });
    }
  });

  test('should debug upload endpoint directly', async ({ page }) => {
    // Test the upload endpoint directly
    await page.goto('http://localhost:3001');
    
    // Create a simple test page to debug upload
    await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = `
        <h1>Upload Test</h1>
        <input type="file" id="testFile" accept="image/*">
        <button id="testUpload">Test Upload</button>
        <div id="result"></div>
      `;
      document.body.appendChild(testDiv);
      
      document.getElementById('testUpload')?.addEventListener('click', async () => {
        const fileInput = document.getElementById('testFile') as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        if (!file) {
          document.getElementById('result')!.innerHTML = 'No file selected';
          return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          document.getElementById('result')!.innerHTML = `
            <h3>Upload Result:</h3>
            <pre>${JSON.stringify(result, null, 2)}</pre>
          `;
        } catch (error) {
          document.getElementById('result')!.innerHTML = `Error: ${error}`;
        }
      });
    });
    
    // Use the test file
    const testImagePath = path.join(process.cwd(), 'public/uploads/1b8359c1-914a-41c4-8520-b05eb083062a.jpg');
    await page.locator('#testFile').setInputFiles(testImagePath);
    await page.click('#testUpload');
    
    // Wait for result
    await page.waitForTimeout(5000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'tests/screenshots/direct-upload-test.png' });
    
    // Get the result
    const resultText = await page.locator('#result').textContent();
    console.log('Direct upload result:', resultText);
  });
});