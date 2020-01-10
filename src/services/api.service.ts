// import _ from "lodash";

// export default class ApiService {
//   baseUrl = "";
const baseUrl = "";

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

async function post(url: string, body: FormData | null): Promise<any> {
  url = baseUrl.concat(url);
  const resp = await fetch(url, {
    method: "POST",
    body: toSnakeCase(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  const data = await resp.json();
  return toCamelCase(data);
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

function isLoggedIn() {
  return false;
}
// }

export { get, post, patch, del, isLoggedIn };
