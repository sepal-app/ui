import _ from "lodash";

const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string;
const sepalClientId = process.env.REACT_APP_SEPAL_CLIENT_ID as string;
const sepalClientSecret = process.env.REACT_APP_SEPAL_CLIENT_SECRET as string;

function accessToken(token?: string | null) {
  if (token === null) {
    localStorage.removeItem("accessToken");
  } else if (!token) {
    return localStorage.getItem("accessToken");
  }

  localStorage.setItem("accessToken", token as string);
}

function refreshToken(token?: string | null) {
  if (token === null) {
    localStorage.removeItem("accessToken");
  } else if (!token) {
    return localStorage.getItem("refreshToken");
  }

  localStorage.setItem("refreshToken", token as string);
}

class ResponseError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

function toCamelCase<T>(obj: any): T {
  return _.transform<any, T>(
    obj,
    (result: T, value: any, key: string) => {
      if (_.isArray(value) && value.length && _.isPlainObject(value[0])) {
        value = value.map(i => toCamelCase(i));
      } else if (_.isPlainObject(value)) {
        value = toCamelCase(value);
      }
      (result as any)[_.camelCase(key)] = value;
    },
    {} as T
  );
}

function toSnakeCase<T>(obj: any): T {
  return _.transform<any, T>(
    obj,
    (result: T, value: any, key: string) => {
      if (_.isArray(value) && value.length && _.isPlainObject(value[0])) {
        value = value.map(i => toSnakeCase(i));
      } else if (_.isObject(value)) {
        value = toSnakeCase(value);
      }
      (result as any)[_.snakeCase(key)] = value;
    },
    {} as T
  );
}

async function request(url: string, options?: RequestInit): Promise<any> {
  return fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken()}`,
      ...options?.headers
    },
    ...options
  });
}

async function get<T>(url: string): Promise<T> {
  url = baseUrl.concat(url);
  const resp = await request(url);
  if (!resp.ok) {
    throw new ResponseError(resp.statusText, resp);
  }

  const data = await resp.json();
  return toCamelCase(data);
}

async function post<T>(url: string, data: object): Promise<T> {
  url = baseUrl.concat(url);
  const body = JSON.stringify(toSnakeCase(data));
  const resp = await request(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken()}`
    }
  });
  const json = await resp.json();
  return toCamelCase(json);
}

async function patch<T>(url: string, body: any | null): Promise<T> {
  url = baseUrl.concat(url);
  const resp = await fetch(url, {
    method: "PATCH",
    body: toSnakeCase(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken()}`
    }
  });
  const data = await resp.json();
  return toCamelCase(data);
}

async function del(url: string): Promise<any> {
  url = baseUrl.concat(url);
  return await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

async function login(username: string, password: string): Promise<any> {
  const url = baseUrl.concat("/o/token/");
  const data = new FormData();
  data.set("username", username);
  data.set("password", password);
  data.set("client_id", sepalClientId);
  data.set("client_secret", sepalClientSecret);
  data.set("grant_type", "password");
  data.set("scope", "read write admin");
  const resp = await fetch(url, {
    method: "POST",
    body: data
  });
  const json = await resp.json();
  accessToken(json.access_token);
  refreshToken(json.refresh_token);
  return json;
}

async function logout() {
  accessToken(null);
  refreshToken(null);
  return Promise.resolve();
}

function isLoggedIn() {
  return !!accessToken();
}

export { baseUrl, get, post, patch, del, login, logout, isLoggedIn };
