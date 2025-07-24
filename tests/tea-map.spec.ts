import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Tea Map Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the map page
    await page.goto('http://localhost:3001/map');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Wait for the map to initialize
    await page.waitForTimeout(2000);
  });

  test('should load the main page without white screen', async ({ page }) => {
    // Check if the main elements are visible
    await expect(page.locator('text=Tea Spot')).toBeVisible();
    
    // Check if the map container is present
    await expect(page.locator('[role="application"]')).toBeVisible();
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'tests/screenshots/main-page.png' });
  });

  test('should display empty state when no spots exist', async ({ page }) => {
    // Check for empty state message
    await expect(page.locator('text=Добро пожаловать в Tea Spot!')).toBeVisible();
    
    // Check for instruction text
    await expect(page.locator('text=Кликните на карту')).toBeVisible();
  });

  test('should open spot form when clicking on map', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[role="application"]');
    
    // Click on the map area
    await page.locator('[role="application"]').click();
    
    // Check if the spot form modal appears
    await expect(page.locator('text=Добавить новый спот')).toBeVisible();
    
    // Check if form fields are present
    await expect(page.locator('input[placeholder*="Название"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Краткое описание"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Подробное описание"]')).toBeVisible();
    
    // Take a screenshot of the form
    await page.screenshot({ path: 'tests/screenshots/spot-form.png' });
  });

  test('should create a new spot with photo upload', async ({ page }) => {
    // Click on the map to open form
    await page.locator('[role="application"]').click();
    
    // Wait for form to appear
    await expect(page.locator('text=Добавить новый спот')).toBeVisible();
    
    // Fill in the form
    await page.locator('input[placeholder*="Название"]').fill('Test Tea Spot');
    await page.locator('input[placeholder*="Краткое описание"]').fill('Great place for tea');
    await page.locator('textarea[placeholder*="Подробное описание"]').fill('This is a detailed description of the tea spot with amazing atmosphere and great tea selection.');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    const fs = require('fs');
    
    // Create a minimal PNG file
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // RGB, no compression
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // minimal image data
      0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, // checksum
      0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, // IEND chunk
      0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    if (!fs.existsSync(path.dirname(testImagePath))) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    }
    fs.writeFileSync(testImagePath, pngData);
    
    // Upload the test image
    await page.setInputFiles('input[type="file"]', testImagePath);
    
    // Wait for upload to complete
    await page.waitForTimeout(1000);
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Wait for the spot to be created and form to close
    await page.waitForTimeout(2000);
    
    // Check if the spot appears in the list
    await expect(page.locator('text=Test Tea Spot')).toBeVisible();
    
    // Take a screenshot with the new spot
    await page.screenshot({ path: 'tests/screenshots/spot-created.png' });
    
    // Clean up the test image
    fs.unlinkSync(testImagePath);
  });

  test('should display spot details when clicked', async ({ page }) => {
    // First create a spot (reuse logic from previous test)
    await page.locator('[role="application"]').click();
    await page.locator('input[placeholder*="Название"]').fill('Test Spot for Details');
    await page.locator('input[placeholder*="Краткое описание"]').fill('Short description');
    await page.locator('textarea[placeholder*="Подробное описание"]').fill('Long description for testing modal display');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    // Click on the spot in the list
    await page.locator('text=Test Spot for Details').click();
    
    // Check if modal opens with spot details
    await expect(page.locator('text=Test Spot for Details')).toBeVisible();
    await expect(page.locator('text=Short description')).toBeVisible();
    await expect(page.locator('text=Long description for testing modal display')).toBeVisible();
    
    // Take a screenshot of the modal
    await page.screenshot({ path: 'tests/screenshots/spot-modal.png' });
    
    // Close the modal
    await page.locator('button[aria-label*="Закрыть"]').click();
    
    // Check if modal is closed
    await expect(page.locator('text=Test Spot for Details')).not.toBeVisible();
  });

  test('should persist spots after page refresh', async ({ page }) => {
    // Create a spot first
    await page.locator('[role="application"]').click();
    await page.locator('input[placeholder*="Название"]').fill('Persistent Test Spot');
    await page.locator('input[placeholder*="Краткое описание"]').fill('This should persist after refresh');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    // Verify spot exists
    await expect(page.locator('text=Persistent Test Spot')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if spot still exists after refresh
    await expect(page.locator('text=Persistent Test Spot')).toBeVisible();
    
    // Take a screenshot after refresh
    await page.screenshot({ path: 'tests/screenshots/after-refresh.png' });
  });

  test('should navigate to random spot', async ({ page }) => {
    // Create multiple spots first
    const spots = [
      { name: 'Random Spot 1', description: 'First random spot' },
      { name: 'Random Spot 2', description: 'Second random spot' },
      { name: 'Random Spot 3', description: 'Third random spot' }
    ];
    
    for (const spot of spots) {
      await page.locator('[role="application"]').click();
      await page.locator('input[placeholder*="Название"]').fill(spot.name);
      await page.locator('input[placeholder*="Краткое описание"]').fill(spot.description);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
    }
    
    // Check if all spots are visible in the list
    for (const spot of spots) {
      await expect(page.locator(`text=${spot.name}`)).toBeVisible();
    }
    
    // Click the random spot button
    await page.locator('text=Найти лучший спот').click();
    
    // Wait for animation to complete
    await page.waitForTimeout(2000);
    
    // Check if a spot modal opens (random spot should be selected)
    // Note: We can't predict which spot will be selected, so we check for any modal
    const modalVisible = await page.locator('button[aria-label*="Закрыть"]').isVisible();
    expect(modalVisible).toBe(true);
    
    // Take a screenshot of the random spot selection
    await page.screenshot({ path: 'tests/screenshots/random-spot.png' });
  });

  test('should show spots count in the list', async ({ page }) => {
    // Create a few spots
    for (let i = 1; i <= 3; i++) {
      await page.locator('[role="application"]').click();
      await page.locator('input[placeholder*="Название"]').fill(`Spot ${i}`);
      await page.locator('input[placeholder*="Краткое описание"]').fill(`Description ${i}`);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
    }
    
    // Check spots count display
    await expect(page.locator('text=3 спота найдено')).toBeVisible();
    
    // Take a screenshot showing the count
    await page.screenshot({ path: 'tests/screenshots/spots-count.png' });
  });
});