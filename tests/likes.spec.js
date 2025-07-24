const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3002';

test.describe('Like functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should like an activity and persist after refresh', async ({ page }) => {
    // First, check if user is authenticated by looking for dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Wait for activities to load
    await page.waitForSelector('[data-testid="activity-card"]', { timeout: 10000 });
    
    // Find the first activity card
    const activityCard = page.locator('[data-testid="activity-card"]').first();
    
    // Get the like button and initial count
    const likeButton = activityCard.locator('[data-testid="like-button"]');
    const likeCount = activityCard.locator('[data-testid="like-count"]');
    
    // Get initial like count
    const initialCount = await likeCount.textContent();
    console.log('Initial like count:', initialCount);
    
    // Click the like button
    await likeButton.click();
    
    // Wait for the like to be processed
    await page.waitForTimeout(1000);
    
    // Check if the count increased
    const newCount = await likeCount.textContent();
    console.log('New like count after click:', newCount);
    
    // Convert to numbers and compare
    const initialNum = parseInt(initialCount || '0');
    const newNum = parseInt(newCount || '0');
    
    expect(newNum).toBeGreaterThan(initialNum);
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for activities to load after refresh
    await page.waitForSelector('[data-testid="activity-card"]', { timeout: 10000 });
    
    // Check if the like count persisted
    const activityCardAfterRefresh = page.locator('[data-testid="activity-card"]').first();
    const likeCountAfterRefresh = activityCardAfterRefresh.locator('[data-testid="like-count"]');
    
    const countAfterRefresh = await likeCountAfterRefresh.textContent();
    console.log('Like count after refresh:', countAfterRefresh);
    
    const countAfterRefreshNum = parseInt(countAfterRefresh || '0');
    expect(countAfterRefreshNum).toBe(newNum);
    
    console.log('✅ Like functionality test passed!');
  });

  test('should like an activity on activity detail page and persist after refresh', async ({ page }) => {
    // Navigate to dashboard first
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('[data-testid="activity-card"]', { timeout: 10000 });
    
    // Click on the first activity to go to detail page
    const activityCard = page.locator('[data-testid="activity-card"]').first();
    await activityCard.click();
    
    // Wait for activity detail page to load
    await page.waitForLoadState('networkidle');
    
    // Find the like button on the detail page
    const likeButton = page.locator('[data-testid="like-button"]');
    const likeCount = page.locator('[data-testid="like-count"]');
    
    // Get initial like count
    const initialCount = await likeCount.textContent();
    console.log('Initial like count on detail page:', initialCount);
    
    // Click the like button
    await likeButton.click();
    
    // Wait for the like to be processed
    await page.waitForTimeout(1000);
    
    // Check if the count changed
    const newCount = await likeCount.textContent();
    console.log('New like count after click on detail page:', newCount);
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if the like count persisted
    const likeCountAfterRefresh = page.locator('[data-testid="like-count"]');
    const countAfterRefresh = await likeCountAfterRefresh.textContent();
    console.log('Like count after refresh on detail page:', countAfterRefresh);
    
    // The count should be the same as before refresh
    expect(countAfterRefresh).toBe(newCount);
    
    console.log('✅ Activity detail page like functionality test passed!');
  });

  test('should show correct like counts in backend API', async ({ page }) => {
    // Test the backend API directly
    const response = await page.request.get(`${BACKEND_URL}/api/activities`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('Backend API response structure:', {
      success: data.success,
      hasData: !!data.data,
      hasActivities: !!data.data?.data,
      firstActivity: data.data?.data?.[0] ? {
        id: data.data.data[0].id,
        title: data.data.data[0].title,
        like_count: data.data.data[0].like_count,
        is_liked: data.data.data[0].is_liked,
        _count: data.data.data[0]._count
      } : null
    });
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.data).toBeDefined();
    
    // Check if activities have like_count and is_liked fields
    if (data.data.data.length > 0) {
      const firstActivity = data.data.data[0];
      expect(firstActivity).toHaveProperty('like_count');
      expect(firstActivity).toHaveProperty('is_liked');
      
      console.log('✅ Backend API returns correct like fields!');
    }
  });
});