// Example utility functions to test
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// Unit tests
import { formatDate, calculateReadingTime, slugify } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('January 15, 2024');
    });

    it('handles different dates', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('December 25, 2023');
    });
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time for short content', () => {
      const content = 'This is a short article.';
      expect(calculateReadingTime(content)).toBe(1);
    });

    it('calculates reading time for long content', () => {
      const content = 'word '.repeat(500);
      expect(calculateReadingTime(content)).toBe(3); // 500/200 = 2.5 → 3
    });

    it('handles empty content', () => {
      expect(calculateReadingTime('')).toBe(0);
    });
  });

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special@Chars#Here')).toBe('specialcharshere');
    });

    it('handles edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('---')).toBe('');
    });
  });
});
