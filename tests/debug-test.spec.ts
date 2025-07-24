import { test, expect } from '@playwright/test';

test('Debug white screen issue', async ({ page }) => {
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  // Navigate to the map page
  await page.goto('http://localhost:3002/map');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/screenshots/debug.png' });
  
  // Check what's in the page
  const content = await page.content();
  console.log('Page HTML length:', content.length);
  
  // Check if main elements exist
  const header = await page.locator('text=Tea Spot').count();
  console.log('Header elements found:', header);
  
  const mapContainer = await page.locator('[role="application"]').count();
  console.log('Map containers found:', mapContainer);
  
  // Check if the map container is visible
  if (mapContainer > 0) {
    const isVisible = await page.locator('[role="application"]').isVisible();
    console.log('Map container is visible:', isVisible);
    
    // Check computed styles
    const styles = await page.locator('[role="application"]').evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        width: computed.width,
        height: computed.height,
        position: computed.position,
        zIndex: computed.zIndex
      };
    });
    console.log('Map container styles:', styles);
  }
  
  // Check if there are any spots loaded
  const spotsText = await page.locator('text=спот').count();
  console.log('Spots text found:', spotsText);
});