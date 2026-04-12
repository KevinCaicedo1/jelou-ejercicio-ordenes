const { ValidationError } = require('../errors/AppError');

function encodeCursor(id) {
  return Buffer.from(String(id), 'utf8').toString('base64');
}

function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const id = Number(decoded);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid cursor payload');
    }
    return id;
  } catch (_error) {
    throw new ValidationError('Invalid cursor value');
  }
}

function buildCursorQuery(cursor) {
  if (!cursor) {
    return { condition: '', param: null };
  }
  const id = decodeCursor(cursor);
  return { condition: 'AND id > ?', param: id };
}

module.exports = {
  encodeCursor,
  decodeCursor,
  buildCursorQuery
};