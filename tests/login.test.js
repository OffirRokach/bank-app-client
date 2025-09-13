// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('Login and logout functionality', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:5173/login');
    
    // Fill in login credentials
    await page.getByRole('textbox', { name: 'Email Address' }).fill('david.day@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('SecurePass123!');
    
    // Click the sign in button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify we're on the dashboard page
    await expect(page).toHaveURL('http://localhost:5173/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome, David' })).toBeVisible();
    
    // Check localStorage before logout
    const localStorageBeforeLogout = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) {
          const value = localStorage.getItem(key);
          items[key] = value !== null ? value : '';
        }
      }
      return items;
    });
    
    // Verify authToken and currentAccountId exist in localStorage
    expect(localStorageBeforeLogout).toHaveProperty('authToken');
    expect(localStorageBeforeLogout).toHaveProperty('currentAccountId');
    
    // Click the logout button
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Verify we're redirected to the login page
    await expect(page).toHaveURL('http://localhost:5173/login');
    
    // Check localStorage after logout
    const localStorageAfterLogout = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) {
          const value = localStorage.getItem(key);
          items[key] = value !== null ? value : '';
        }
      }
      return items;
    });
    
    // Verify localStorage is empty after logout
    expect(Object.keys(localStorageAfterLogout).length).toBe(0);
    expect(localStorageAfterLogout).not.toHaveProperty('authToken');
    expect(localStorageAfterLogout).not.toHaveProperty('currentAccountId');
  });
});
