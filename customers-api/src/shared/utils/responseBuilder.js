function success(data, meta = undefined) {
  if (meta) {
    return { success: true, data, ...meta };
  }

  return { success: true, data };
}

function error(code, message, details = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}

module.exports = {
  success,
  error
};
