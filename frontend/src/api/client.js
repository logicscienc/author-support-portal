
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export async function apiRequest(
  path,
  { method = "GET", body, token, auth = true, headers = {} } = {}
) {
  const savedToken =
    token ??
    (typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("token")
      : null);

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth && savedToken) {
    requestHeaders.Authorization = `Bearer ${savedToken}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check that your backend is running."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      result?.error?.message ||
      result?.message ||
      `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.code = result?.error?.code;
    throw error;
  }

  return result;
}
