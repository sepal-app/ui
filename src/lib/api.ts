import _ from "lodash";

const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string;
const sepalClientId = process.env.REACT_APP_SEPAL_CLIENT_ID as string;
const sepalClientSecret = process.env.REACT_APP_SEPAL_CLIENT_SECRET as string;

function accessToken(token?: string) {
  if (!token) {
    return localStorage.getItem("refresh_token");
  }

  console.log(`setting token: ${token}`);
  localStorage.setItem("access_token", token as string);
}

function refreshToken(token?: string) {
  if (!token) {
    return localStorage.getItem("refresh_token");
  }

  localStorage.setItem("refresh_token", token as string);
}

function toCamelCase(obj: any): any {
  return obj;
  // return _.transform(
  //   obj,
  //   (result, value, key) => {
  //     if (_.isArray(value) && value.length && _.isPlainObject(value[0])) {
  //       value = value.map(i => this.toCamelCase(i));
  //     } else if (_.isPlainObject(value)) {
  //       value = this.toCamelCase(value);
  //     }
  //     result[_.camelCase(key)] = value;
  //   },
  //   {}
  // );
}

function toSnakeCase(obj: any): any {
  return obj;
  // return _.transform(
  //   obj,
  //   (result, value, key) => {
  //     if (_.isArray(value) && value.length && _.isPlainObject(value[0])) {
  //       value = value.map(i => this.toSnakeCase(i));
  //     } else if (_.isObject(value)) {
  //       value = this.toSnakeCase(value);
  //     }
  //     result[_.snakeCase(key)] = value;
  //   },
  //   {}
  // );
}

async function get(url: string): Promise<any> {
  url = baseUrl.concat(url);
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await resp.json();
  return toCamelCase(data);
}

async function post(url: string, data: object): Promise<any> {
  url = baseUrl.concat(url);
  const body = JSON.stringify(toSnakeCase(data));
  const resp = await fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  const json = await resp.json();
  return toCamelCase(json);
}

async function patch(url: string, body: any | null): Promise<any> {
  url = baseUrl.concat(url);
  const resp = await fetch(url, {
    method: "PATCH",
    body: toSnakeCase(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  const data = await resp.json();
  return toCamelCase(data);
}

async function del(url: string): Promise<any> {
  url = baseUrl.concat(url);
  return await fetch(url, { method: "DELETE" });
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
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return Promise.resolve();
}

function isLoggedIn() {
  console.log(`accessToken: ${accessToken()}`);
  return !!accessToken();
}

export { baseUrl, get, post, patch, del, login, logout, isLoggedIn };
