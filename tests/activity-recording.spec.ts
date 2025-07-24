import { test, expect } from '@playwright/test';

// Test data
const testActivity = {
  title: 'Morning Sencha Session',
  description: 'A peaceful morning tea session in the garden with fresh sencha',
  teaType: 'sencha',
  duration: '45',
  moodBefore: 'calm',
  moodAfter: 'energetic',
  tasteNotes: 'Fresh, grassy, with hints of seaweed and umami',
  insights: 'This session helped me focus for the day ahead',
  weather: 'Sunny and cool',
  companions: ['Anna', 'Mikhail']
};

const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  displayName: 'Test User'
};

test.describe('Activity Recording Features', () => {
  test.beforeEach(async ({ page }) => {
    // Start both frontend and backend servers
    await page.goto('/');
    
    // Navigate to auth page and login (assuming authentication is needed)
    await page.goto('/auth');
    
    // Try to login with Google OAuth or skip if already authenticated
    try {
      // Check if already authenticated by looking for dashboard redirect
      await page.waitForURL('/dashboard', { timeout: 5000 });
    } catch {
      // If not authenticated, look for Google sign-in button
      const googleButton = page.locator('text=Войти через Google');
      if (await googleButton.isVisible()) {
        await googleButton.click();
        // Note: In a real test, you'd need to handle OAuth flow
        // For now, we'll simulate being logged in
        await page.goto('/dashboard');
      }
    }
  });

  test('Test 1: Adding activity from dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Чайная лента');
    
    // Click "Record Activity" button
    await page.locator('text=Записать сессию').click();
    
    // Wait for activity form to open
    await expect(page.locator('text=Записать чайную сессию')).toBeVisible();
    
    // Fill out the activity form
    await page.fill('input[placeholder*="Например: Утренняя сенча"]', testActivity.title);
    
    // Select tea type
    await page.selectOption('select', testActivity.teaType);
    
    // Fill description
    await page.fill('textarea[placeholder*="Опишите вашу чайную сессию"]', testActivity.description);
    
    // Fill duration
    await page.fill('input[placeholder="30"]', testActivity.duration);
    
    // Select mood before
    await page.selectOption('select >> nth=1', testActivity.moodBefore);
    
    // Select mood after  
    await page.selectOption('select >> nth=2', testActivity.moodAfter);
    
    // Fill taste notes
    await page.fill('textarea[placeholder*="Сладкий, цветочный"]', testActivity.tasteNotes);
    
    // Fill insights
    await page.fill('textarea[placeholder*="Что вы почувствовали"]', testActivity.insights);
    
    // Fill weather
    await page.fill('input[placeholder="Солнечно, прохладно"]', testActivity.weather);
    
    // Add companions
    for (const companion of testActivity.companions) {
      await page.fill('input[placeholder="Добавить компаньона"]', companion);
      await page.click('button:has-text("+")');
    }
    
    // Verify companions were added
    for (const companion of testActivity.companions) {
      await expect(page.locator(`text=${companion}`)).toBeVisible();
    }
    
    // Submit the form
    await page.click('button:has-text("Записать сессию")');
    
    // Wait for success message or redirect
    await expect(page.locator('text=Чайная сессия записана')).toBeVisible({ timeout: 10000 });
    
    // Verify activity appears in dashboard feed
    await expect(page.locator(`text=${testActivity.title}`)).toBeVisible();
  });

  test('Test 2: Surfing list of activities', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for activities to load
    await expect(page.locator('h1')).toContainText('Чайная лента');
    
    // Check if activity list is visible
    await expect(page.locator('text=Чайные сессии')).toBeVisible();
    
    // Look for activity cards
    const activityCards = page.locator('[class*="bg-white rounded-lg shadow"]');
    
    // Verify at least one activity card exists
    await expect(activityCards.first()).toBeVisible();
    
    // Test activity card interactions
    const firstActivity = activityCards.first();
    
    // Check if activity has required elements
    await expect(firstActivity.locator('[class*="font-semibold"]')).toBeVisible(); // Title
    await expect(firstActivity.locator('[class*="text-gray-500"]')).toBeVisible(); // Time
    
    // Test like functionality
    const likeButton = firstActivity.locator('button[class*="text-red-500"], button[class*="text-gray-500"]:has(svg)').first();
    if (await likeButton.isVisible()) {
      await likeButton.click();
      // Wait for like to register
      await page.waitForTimeout(1000);
    }
    
    // Test clicking on activity card
    await firstActivity.click();
    
    // Should navigate to activity detail page
    await expect(page.url()).toMatch(/\/activities\/[a-zA-Z0-9]+/);
    
    // Go back to dashboard
    await page.goBack();
    
    // Test navigation between tabs
    await page.click('text=Карта');
    await expect(page.url()).toContain('/map');
    
    await page.click('text=Лента');
    await expect(page.url()).toContain('/dashboard');
    
    // Test scrolling and loading more activities
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Look for "Load More" button if pagination is implemented
    const loadMoreButton = page.locator('button:has-text("Загрузить ещё")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Test 3: Form activity to profile activities flow', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click "Record Activity" button
    await page.locator('text=Записать сессию').click();
    
    // Fill out a minimal activity form
    await page.fill('input[placeholder*="Например: Утренняя сенча"]', 'Profile Test Activity');
    await page.selectOption('select', 'green');
    await page.fill('textarea[placeholder*="Опишите вашу чайную сессию"]', 'Testing profile flow');
    
    // Submit the form
    await page.click('button:has-text("Записать сессию")');
    
    // Wait for success
    await expect(page.locator('text=Чайная сессия записана')).toBeVisible({ timeout: 10000 });
    
    // Navigate to profile page
    await page.click('text=Профиль');
    await expect(page.url()).toContain('/profile');
    
    // Wait for profile to load
    await expect(page.locator('h1')).toContainText('Test User'); // Or current user's name
    
    // Check for user stats
    await expect(page.locator('text=Статистика')).toBeVisible();
    await expect(page.locator('text=Всего сессий')).toBeVisible();
    
    // Check for activity timeline
    await expect(page.locator('text=Мои чайные сессии')).toBeVisible();
    
    // Verify the newly created activity appears in profile
    await expect(page.locator('text=Profile Test Activity')).toBeVisible();
    
    // Test activity card in profile
    const profileActivityCard = page.locator('text=Profile Test Activity').locator('..');
    await expect(profileActivityCard).toBeVisible();
    
    // Click on activity to go to detail page
    await profileActivityCard.click();
    
    // Should navigate to activity detail page
    await expect(page.url()).toMatch(/\/activities\/[a-zA-Z0-9]+/);
    
    // Verify activity details are shown
    await expect(page.locator('h1')).toContainText('Profile Test Activity');
    await expect(page.locator('text=Testing profile flow')).toBeVisible();
    
    // Test navigation back to profile
    await page.click('text=Назад');
    await expect(page.url()).toContain('/profile');
    
    // Test creating another activity from profile
    await page.click('text=Записать сессию');
    
    // Fill minimal form
    await page.fill('input[placeholder*="Например: Утренняя сенча"]', 'Second Profile Activity');
    await page.selectOption('select', 'oolong');
    
    // Submit
    await page.click('button:has-text("Записать сессию")');
    
    // Wait for success
    await expect(page.locator('text=Чайная сессия записана')).toBeVisible({ timeout: 10000 });
    
    // Verify both activities are now in profile
    await expect(page.locator('text=Profile Test Activity')).toBeVisible();
    await expect(page.locator('text=Second Profile Activity')).toBeVisible();
    
    // Test profile stats updated
    const statsSection = page.locator('text=Статистика').locator('..');
    await expect(statsSection).toBeVisible();
    
    // Check that activity count increased (assuming it shows real numbers)
    // This might need to be adjusted based on actual implementation
  });

  test('Test 4: Activity recording from map spot', async ({ page }) => {
    // Navigate to map
    await page.goto('/map');
    
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet-container"]', { timeout: 10000 });
    
    // Look for existing spots on the map
    const spotMarkers = page.locator('[class*="leaflet-marker-icon"]');
    
    if (await spotMarkers.count() > 0) {
      // Click on first spot marker
      await spotMarkers.first().click();
      
      // Wait for spot modal to open
      await expect(page.locator('text=Записать сессию здесь')).toBeVisible();
      
      // Click "Record Activity Here" button
      await page.click('text=Записать сессию здесь');
      
      // Activity form should open with spot pre-selected
      await expect(page.locator('text=Записать чайную сессию')).toBeVisible();
      
      // Fill minimal form
      await page.fill('input[placeholder*="Например: Утренняя сенча"]', 'Map Spot Activity');
      await page.selectOption('select', 'black');
      
      // Submit
      await page.click('button:has-text("Записать сессию")');
      
      // Wait for success
      await expect(page.locator('text=Чайная сессия записана')).toBeVisible({ timeout: 10000 });
      
      // Go back to the spot to verify activity appears
      await spotMarkers.first().click();
      
      // Switch to activities tab in spot modal
      await page.click('text=Чайные сессии');
      
      // Verify activity appears in spot's activity list
      await expect(page.locator('text=Map Spot Activity')).toBeVisible();
    }
  });

  test('Test 5: Activity detail page functionality', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click on first activity card
    const firstActivityCard = page.locator('[class*="bg-white rounded-lg shadow"]').first();
    await firstActivityCard.click();
    
    // Should be on activity detail page
    await expect(page.url()).toMatch(/\/activities\/[a-zA-Z0-9]+/);
    
    // Check for activity details
    await expect(page.locator('h1')).toBeVisible(); // Activity title
    await expect(page.locator('text=Назад')).toBeVisible(); // Back button
    
    // Test like functionality
    const likeButton = page.locator('button:has(svg)').first();
    if (await likeButton.isVisible()) {
      await likeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test share functionality
    const shareButton = page.locator('text=Поделиться');
    if (await shareButton.isVisible()) {
      await shareButton.click();
      // Note: Share functionality might show a toast or copy to clipboard
    }
    
    // Test navigation back
    await page.click('text=Назад');
    await expect(page.url()).toContain('/dashboard');
  });

  test('Test 6: Activity form validation', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click "Record Activity" button
    await page.click('text=Записать сессию');
    
    // Try to submit empty form
    await page.click('button:has-text("Записать сессию")');
    
    // Should show validation errors
    await expect(page.locator('text=Название обязательно')).toBeVisible();
    await expect(page.locator('text=Выберите тип чая')).toBeVisible();
    
    // Fill required fields
    await page.fill('input[placeholder*="Например: Утренняя сенча"]', 'Validation Test');
    await page.selectOption('select', 'green');
    
    // Now submission should work
    await page.click('button:has-text("Записать сессию")');
    
    // Should succeed
    await expect(page.locator('text=Чайная сессия записана')).toBeVisible({ timeout: 10000 });
  });
});

// Helper function to simulate authentication if needed
async function authenticateUser(page: any) {
  // This is a placeholder for authentication
  // In a real test, you'd implement proper OAuth flow simulation
  await page.goto('/auth');
  // Simulate being logged in
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      display_name: 'Test User'
    }));
    sessionStorage.setItem('access_token', 'test-token');
  });
}