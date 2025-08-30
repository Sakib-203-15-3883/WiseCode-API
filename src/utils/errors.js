export const ok = (data, meta) => ({ success: true, data, meta });
export const err = (code, message, details) => ({
  success: false,
  error: { code, message, ...(details ? { details } : {}) }
});
