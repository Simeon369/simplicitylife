const AUTH_TOKEN_KEY = "auth_token";

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}
