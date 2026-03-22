function getRequestBaseUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol = forwardedProto || req.protocol || 'https';
  const host = forwardedHost || req.get('host');

  return `${protocol}://${host}`;
}

function getPublicBaseUrl(req) {
  if (process.env.PUBLIC_BACKEND_URL) {
    return process.env.PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return getRequestBaseUrl(req);
}

module.exports = {
  getPublicBaseUrl,
};
