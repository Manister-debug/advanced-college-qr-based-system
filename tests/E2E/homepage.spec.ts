import { test, expect } from '@playwright/test';

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Next.js App/);
  });

  test('navigates to about page', async ({ page }) => {
    const aboutLink = page.getByRole('link', { name: /about/i });
    await aboutLink.click();
    
    await expect(page).toHaveURL(/.*about/);
    await expect(page.getByRole('heading', { name: /about us/i })).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.fill('test search');
    await searchInput.press('Enter');
    
    await expect(page.getByText(/results for/i)).toBeVisible();
    await expect(page.getByText(/test search/i)).toBeVisible();
  });

  test('user can add item to cart', async ({ page }) => {
    const productCard = page.locator('[data-testid="product-card"]').first();
    const addToCartButton = productCard.getByRole('button', { name: /add to cart/i });
    
    await addToCartButton.click();
    
    // Check cart notification
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Go to cart page
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page.getByText(/your cart/i)).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('contact form submits successfully', async ({ page }) => {
    await page.getByRole('link', { name: /contact/i }).click();
    
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/message/i).fill('Test message');
    
    await page.getByRole('button', { name: /send message/i }).click();
    
    await expect(page.getByText(/thank you for your message/i)).toBeVisible();
  });
});
