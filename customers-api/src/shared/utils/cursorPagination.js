function encodeCursor(id) {
  if (typeof id !== 'number') {
    return null;
  }

  return Buffer.from(String(id), 'utf8').toString('base64');
}

function decodeCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    const value = Number(raw);
    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

module.exports = {
  encodeCursor,
  decodeCursor
};
