const {
  encodeCursor,
  decodeCursor
} = require('../../src/shared/utils/cursorPagination');

describe('cursorPagination', () => {
  it('encodes and decodes cursor', () => {
    const encoded = encodeCursor(25);
    expect(encoded).toBeTruthy();
    expect(decodeCursor(encoded)).toBe(25);
  });

  it('returns null for invalid cursor', () => {
    expect(decodeCursor('invalid')).toBeNull();
  });
});
