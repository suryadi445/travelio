import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGoogleBooksUrl, normalizeBook } from '../src/services/googleBooksService.js';

test('normalizes incomplete Google Books volumes safely', () => {
  assert.deepEqual(normalizeBook({ id: 'abc' }), {
    googleBookId: 'abc', title: 'Untitled book', authors: [], thumbnail: '', rating: null,
  });
});

test('normalizes book details and clamps rating', () => {
  assert.deepEqual(normalizeBook({ id: 'id', volumeInfo: {
    title: ' Clean Code ', authors: ['Robert C. Martin'], imageLinks: { thumbnail: 'http://books.test/cover' }, averageRating: 5.5,
  } }), {
    googleBookId: 'id', title: 'Clean Code', authors: ['Robert C. Martin'], thumbnail: 'https://books.test/cover', rating: 5,
  });
});

test('builds Google Books search URL without an API key by default', () => {
  const url = buildGoogleBooksUrl('Clean Code', '');
  assert.equal(url.searchParams.get('q'), 'Clean Code');
  assert.equal(url.searchParams.get('maxResults'), '30');
  assert.equal(url.searchParams.has('key'), false);
});

test('adds the optional API key to Google Books requests', () => {
  const url = buildGoogleBooksUrl('Clean Code', 'test-key');
  assert.equal(url.searchParams.get('key'), 'test-key');
});
