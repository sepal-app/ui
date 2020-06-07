import { Observable, from } from "rxjs"
import { map, switchMap, tap } from "rxjs/operators"

import { toCamelCase, toSnakeCase } from "./case"
import { accessToken$, logout } from "./auth"

const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string

export const makeResource = <T, F>(pathTemplate: (orgId: string | number) => string) => ({
  get: (
    orgId: string | number,
    id: string | number,
    options?: { expand?: string[]; include?: string[] },
  ): Observable<T> => {
    const params = new URLSearchParams()
    if (options && !!options.expand) {
      params.append("expand", options.expand.join(","))
    }
    if (options && !!options.include) {
      params.append("include", options.include.join(","))
    }
    const queryParams = "?".concat(params.toString())
    const path = [pathTemplate(orgId), id, queryParams].join("/")
    return get<T>(path)
  },

  create: (orgId: string | number, data: F): Observable<T> => {
    const path = pathTemplate(orgId).concat("/")
    return post<T, F>(path, data)
  },

  update: (orgId: string | number, id: string | number, data: F): Observable<T> => {
    const path = [pathTemplate(orgId), id].join("/").concat("/")
    return patch<T, F>(path, data)
  },
})

// class ResponseError extends Error {
//   response: Response

//   constructor(message: string, response: Response) {
//     super(message)
//     this.response = response
//   }
// }

const request = <T>(url: string, options?: RequestInit): Observable<T> =>
  accessToken$.pipe(
    switchMap(accessToken =>
      from(
        fetch(url, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options?.headers,
          },
          ...options,
        }),
      ),
    ),
    tap(resp => {
      if (resp?.status === 401) {
        // TODO: first try to refresh the token
        logout()
      }
    }),
    // TODO: make sure response is JSON
    switchMap(resp => from(resp.json())),
  )

export const get = <T>(path: string): Observable<T> =>
  request<T>(baseUrl.concat(path), { method: "GET" }).pipe(map(data => toCamelCase(data)))

export const post = <T, K>(path: string, data: K): Observable<T> =>
  request<T>(baseUrl.concat(path), {
    method: "POST",
    body: JSON.stringify(toSnakeCase(data)),
  }).pipe(map(data => toCamelCase(data)))

export const patch = <T, K>(path: string, data: K): Observable<T> =>
  request<T>(baseUrl.concat(path), {
    method: "PATCH",
    body: JSON.stringify(toSnakeCase(data)),
  }).pipe(map(data => toCamelCase(data)))

export const del = (path: string): Observable<any> =>
  request<any>(baseUrl.concat(path), {
    method: "DELETE",
  })
