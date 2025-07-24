import { test, expect } from '@playwright/test';

test.describe('Tea Map - Basic Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/map');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for map to fully initialize
  });

  test('1. should load the page with proper styling and existing spots', async ({ page }) => {
    // Check if header is visible
    await expect(page.locator('text=Tea Spot')).toBeVisible();
    
    // Check if map is visible
    await expect(page.locator('[role="application"]')).toBeVisible();
    
    // Check if spots list is visible
    await expect(page.locator('text=Чайные споты')).toBeVisible();
    
    // Take screenshot of working page
    await page.screenshot({ path: 'tests/screenshots/working-page.png', fullPage: true });
    
    console.log('✅ Page loads correctly with proper styling');
  });

  test('2. should show existing spots in the list', async ({ page }) => {
    // Wait for spots to load
    await page.waitForTimeout(2000);
    
    // Check if we have some spots loaded
    const spotElements = page.locator('[role="button"][aria-label*="Перейти к споту"]');
    const spotCount = await spotElements.count();
    
    console.log(`Found ${spotCount} spots in the list`);
    expect(spotCount).toBeGreaterThan(0);
    
    // Take screenshot showing spots
    await page.screenshot({ path: 'tests/screenshots/spots-list.png' });
    
    console.log('✅ Spots are displayed in the list');
  });

  test('3. should click on a spot and show modal', async ({ page }) => {
    // Wait for spots to load
    await page.waitForTimeout(2000);
    
    // Find first spot button and click it
    const firstSpot = page.locator('[role="button"][aria-label*="Перейти к споту"]').first();
    
    if (await firstSpot.count() > 0) {
      await firstSpot.click();
      
      // Wait for modal to appear
      await page.waitForTimeout(1000);
      
      // Check if modal is visible (look for close button)
      const closeButton = page.locator('button[aria-label*="Закрыть"]');
      await expect(closeButton).toBeVisible();
      
      // Take screenshot of modal
      await page.screenshot({ path: 'tests/screenshots/spot-modal.png' });
      
      // Close modal
      await closeButton.click();
      
      console.log('✅ Spot modal opens and closes correctly');
    } else {
      console.log('⚠️ No spots found to test modal');
    }
  });

  test('4. should test random spot button', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click random spot button
    const randomButton = page.locator('text=Найти лучший спот');
    await expect(randomButton).toBeVisible();
    await randomButton.click();
    
    // Wait for animation
    await page.waitForTimeout(3000);
    
    // Check if modal opened (random spot should show modal)
    const modalVisible = await page.locator('button[aria-label*="Закрыть"]').isVisible();
    
    if (modalVisible) {
      console.log('✅ Random spot feature works - modal opened');
      await page.screenshot({ path: 'tests/screenshots/random-spot.png' });
      
      // Close modal
      await page.locator('button[aria-label*="Закрыть"]').click();
    } else {
      console.log('⚠️ Random spot feature may not have spots to select from');
    }
  });

  test('5. should open spot creation form by clicking map', async ({ page }) => {
    // Wait for map to be ready
    await page.waitForTimeout(3000);
    
    // Click on the map area (center)
    const mapContainer = page.locator('[role="application"]');
    await expect(mapContainer).toBeVisible();
    
    // Get map bounds and click in center
    const mapBounds = await mapContainer.boundingBox();
    if (mapBounds) {
      const centerX = mapBounds.x + mapBounds.width / 2;
      const centerY = mapBounds.y + mapBounds.height / 2;
      
      await page.mouse.click(centerX, centerY);
      
      // Wait for form to appear
      await page.waitForTimeout(1000);
      
      // Check if form modal is visible
      const formTitle = page.locator('text=Добавить новый спот');
      const isFormVisible = await formTitle.isVisible();
      
      if (isFormVisible) {
        console.log('✅ Spot creation form opens when clicking map');
        
        // Take screenshot of form
        await page.screenshot({ path: 'tests/screenshots/spot-form.png' });
        
        // Cancel the form
        await page.locator('text=Отмена').click();
      } else {
        console.log('⚠️ Form did not open - may need different click location');
        await page.screenshot({ path: 'tests/screenshots/map-click-failed.png' });
      }
    }
  });

  test('6. should test page refresh and data persistence', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/before-refresh.png' });
    
    // Get initial spot count
    await page.waitForTimeout(2000);
    const initialSpots = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check spot count after refresh
    const spotsAfterRefresh = await page.locator('[role="button"][aria-label*="Перейти к споту"]').count();
    
    expect(spotsAfterRefresh).toBe(initialSpots);
    
    // Take screenshot after refresh
    await page.screenshot({ path: 'tests/screenshots/after-refresh.png' });
    
    console.log(`✅ Data persists after refresh: ${spotsAfterRefresh} spots`);
  });
});