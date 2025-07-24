import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Tea Map Application - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the map page
    await page.goto('http://localhost:3002/map');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('1. Application loads successfully', async ({ page }) => {
    // Check main elements are visible
    await expect(page.locator('text=Tea Spot')).toBeVisible();
    await expect(page.locator('[role="application"]')).toBeVisible();
    
    // Check that spots are loaded from database
    await expect(page.locator('text=спот')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/app-loaded.png' });
    
    console.log('✅ Application loaded successfully');
  });

  test('2. Adding new spot with photo upload', async ({ page }) => {
    // Count existing spots
    const existingSpots = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    console.log(`Current spots: ${existingSpots}`);
    
    // Click on the map to open form
    await page.locator('[role="application"]').click({ position: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);
    
    // Check if form appeared
    await expect(page.locator('text=Добавить новый спот')).toBeVisible();
    
    // Fill form
    await page.locator('input[placeholder*="Название"]').fill('Test Tea Spot');
    await page.locator('input[placeholder*="Краткое описание"]').fill('Great place for tea testing');
    await page.locator('textarea[placeholder*="Подробное описание"]').fill('This is a comprehensive test spot for our tea map application.');
    
    // Create and upload a test image
    const testImagePath = path.join(__dirname, 'test-image.png');
    const fs = require('fs');
    
    // Create a minimal PNG file
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21,
      0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
      0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    if (!fs.existsSync(path.dirname(testImagePath))) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    }
    fs.writeFileSync(testImagePath, pngData);
    
    // Upload image
    await page.setInputFiles('input[type="file"]', testImagePath);
    await page.waitForTimeout(2000);
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    
    // Verify new spot was created
    const newSpotCount = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    expect(newSpotCount).toBe(existingSpots + 1);
    
    // Check that new spot appears in the list
    await expect(page.locator('text=Test Tea Spot')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/spot-added.png' });
    
    // Clean up
    fs.unlinkSync(testImagePath);
    
    console.log('✅ Successfully added new spot with photo');
  });

  test('3. Viewing spot details', async ({ page }) => {
    // Find and click on any existing spot
    const spotButtons = page.locator('[role="button"][aria-label*="Перейти к споту"]');
    const spotCount = await spotButtons.count();
    
    if (spotCount > 0) {
      await spotButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Check if modal opened
      await expect(page.locator('button[aria-label*="Закрыть"]')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/spot-modal.png' });
      
      // Close modal
      await page.locator('button[aria-label*="Закрыть"]').click();
      await page.waitForTimeout(500);
      
      console.log('✅ Successfully viewed spot details');
    } else {
      console.log('⚠️  No spots found to test modal');
    }
  });

  test('4. Page refresh persistence', async ({ page }) => {
    // Get current spots count
    const initialCount = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    console.log(`Initial spots count: ${initialCount}`);
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check spots are still there
    const afterRefreshCount = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    console.log(`After refresh count: ${afterRefreshCount}`);
    
    expect(afterRefreshCount).toBe(initialCount);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/after-refresh.png' });
    
    console.log('✅ Spots persisted after page refresh');
  });

  test('5. Random spot navigation', async ({ page }) => {
    // Check if random spot button exists
    const randomButton = page.locator('text=Найти лучший спот');
    await expect(randomButton).toBeVisible();
    
    // Click random spot button
    await randomButton.click();
    await page.waitForTimeout(3000);
    
    // Should open a modal with spot details
    const modalVisible = await page.locator('button[aria-label*="Закрыть"]').isVisible();
    expect(modalVisible).toBe(true);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/random-spot.png' });
    
    console.log('✅ Random spot navigation works');
  });

  test('6. Spot list display', async ({ page }) => {
    // Check that spots list is visible
    await expect(page.locator('text=Чайные споты')).toBeVisible();
    
    // Check spot count display
    const spotCountElement = await page.locator('text=спот').first();
    await expect(spotCountElement).toBeVisible();
    
    // Get actual count
    const spotCount = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    console.log(`Total spots in list: ${spotCount}`);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/spot-list.png' });
    
    console.log('✅ Spot list displays correctly');
  });

  test('7. Responsive design check', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    // Desktop spot list should be visible
    await expect(page.locator('text=Чайные споты')).toBeVisible();
    
    // Take desktop screenshot
    await page.screenshot({ path: 'tests/screenshots/desktop-view.png' });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Mobile should show collapsible spot list
    await expect(page.locator('text=Споты')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/mobile-view.png' });
    
    console.log('✅ Responsive design works correctly');
  });
});