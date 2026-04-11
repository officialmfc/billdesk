export const CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export function withCorsHeaders(headers: HeadersInit = {}): HeadersInit {
  return {
    ...CORS_HEADERS,
    ...headers,
  };
}
