import { Observable, from, of, zip } from "rxjs"
import { map, switchMap, tap } from "rxjs/operators"
import { fromFetch } from "rxjs/fetch"

import { toCamelCase, toSnakeCase } from "./case"
import { accessToken$, logout } from "./auth"

const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string

const getNextLink = (headers: Headers): string | null => {
  if (!headers.has("link")) {
    return null
  }
  const match = headers.get("link")?.match(/<(.*?)>;\s*?rel=next/)
  if (!match) {
    return null
  }
  return match[1]
}

export type ListOptions = {
  cursor?: string
  limit?: number
  query?: string
}

export type ListResponse<T> = Observable<[T[], ListResponse<T> | null]>

export const makeResource = <T, F>(pathTemplate: (orgId: string | number) => string) => ({
  list: (
    orgId: string | number,
    { cursor = undefined, limit = 50, query = undefined }: ListOptions = {},
  ): ListResponse<T> => {
    const params = new URLSearchParams()
    if (cursor) {
      params.append("cursor", cursor)
    }
    if (limit) {
      params.append("limit", limit.toString())
    }
    if (query) {
      params.append("q", query)
    }

    let url: string | null = [
      baseUrl.concat(pathTemplate(orgId)),
      params.toString(),
    ].join("?")

    const fetchPage = (path: string): ListResponse<T> =>
      request(path, {}).pipe(
        tap(() => console.log("requested page")),
        switchMap((resp: Response) =>
          zip(from(resp.json()), of(getNextLink(resp.headers))),
        ),
        map(([data, nextPageUrl]) => [
          data.map((d: T) => toCamelCase<T>(d)),
          nextPageUrl ? fetchPage(nextPageUrl) : null,
        ]),
      )

    return fetchPage(url)
  },

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
    const path = [pathTemplate(orgId), id].join("/").concat(queryParams)
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

const request = (url: string, options?: RequestInit): Observable<Response> =>
  fromFetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken$.getValue()}`,
      ...options?.headers,
    },
    ...options,
  }).pipe(
    tap((resp) => {
      if (resp?.status === 401) {
        // TODO: first try to refresh the token
        logout()
      }
    }),
    map((resp) => {
      if (!resp.ok) throw resp
      return resp
    }),
    // TODO: make sure response is JSON
    //switchMap((resp) => from(resp.json())),
  )

export const get = <T>(path: string): Observable<T> =>
  request(baseUrl.concat(path), { method: "GET" }).pipe(
    switchMap((resp: Response) => from(resp.json())),
    map((data) =>
      Array.isArray(data)
        ? ((data.map((d) => toCamelCase(d)) as unknown) as T)
        : toCamelCase<T>(data),
    ),
  )

export const post = <T, K>(path: string, data: K): Observable<T> =>
  request(baseUrl.concat(path), {
    method: "POST",
    body: JSON.stringify(toSnakeCase(data)),
  }).pipe(
    switchMap((resp: Response) => from(resp.json())),
    map((data) => toCamelCase(data)),
  )

export const patch = <T, K>(path: string, data: K): Observable<T> =>
  request(baseUrl.concat(path), {
    method: "PATCH",
    body: JSON.stringify(toSnakeCase(data)),
  }).pipe(
    switchMap((resp: Response) => from(resp.json())),
    map((data) => toCamelCase(data)),
  )

export const del = (path: string): Observable<any> =>
  request(baseUrl.concat(path), {
    method: "DELETE",
  })
