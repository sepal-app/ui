import firebase from "firebase/app"
import { toCamelCase, toSnakeCase } from "./case"
import { logout } from "./auth"

export const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string

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
  query?: string | null
  include?: string[]
}

export type ListResponse<T> = T[] & { nextCursor: string | null }

export type PathTemplate = (ids: string[]) => string

export const makeResource = <T, F>(pathTemplate: PathTemplate) => ({
  list: async (
    ids: string[],
    { cursor = undefined, limit = 50, query = undefined, include }: ListOptions = {},
  ): Promise<ListResponse<T>> => {
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
    if (include) {
      for (const e of include) {
        params.append("include", e)
      }
    }

    let url: string | null = [baseUrl.concat(pathTemplate(ids)), params.toString()].join(
      "?",
    )

    const resp = await request(url)
    const data = await resp.json()
    const nextPageUrl = getNextLink(resp.headers)
    // return [respData, nextPageUrl]
    const nextCursor = nextPageUrl
      ? new URL(nextPageUrl).searchParams.get("cursor")
      : null
    // return { data: respData, nextCursor }
    console.log(`nextPageUrl: ${nextPageUrl}`)
    console.log(`nextCursor: ${nextCursor}`)
    data.nextCursor = nextCursor
    return data
  },

  get: async (ids: string[], options?: { include?: string[] }): Promise<T> => {
    const params = new URLSearchParams()
    if (options && !!options.include) {
      params.append("include", options.include.join(","))
    }
    const queryParams = "?".concat(params.toString())
    const path = pathTemplate(ids).concat(queryParams)
    return get<T>(path)
  },

  create: async (ids: string[], data: F): Promise<T> => {
    const path = pathTemplate(ids)
    return post<T, F>(path, data)
  },

  update: async (ids: string[], data: F): Promise<T> => {
    const path = pathTemplate(ids)
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

export const request = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = await firebase.auth().currentUser?.getIdToken()
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  })
  if (resp?.status === 401) {
    // TODO: first try to refresh the token
    logout()
  }

  if (!resp.ok) {
    throw resp
  }

  return resp
}

export const get = async <T>(path: string): Promise<T> => {
  const resp = await request(baseUrl.concat(path), { method: "GET" })
  const respData = await resp.json()
  return Array.isArray(respData)
    ? ((respData.map((d) => toCamelCase(d)) as unknown) as T)
    : toCamelCase<T>(respData)
}

export const post = async <T, K>(path: string, data?: K): Promise<T> => {
  const resp = await request(baseUrl.concat(path), {
    method: "POST",
    body: JSON.stringify(toSnakeCase(data)),
  })
  const respData = await resp.json()
  return toCamelCase(respData)
}

export const patch = async <T, K>(path: string, data: K): Promise<T> => {
  const resp = await request(baseUrl.concat(path), {
    method: "PATCH",
    body: JSON.stringify(toSnakeCase(data)),
  })
  const respData = await resp.json()
  return toCamelCase(respData)
}

export const del = async (path: string): Promise<any> =>
  request(baseUrl.concat(path), {
    method: "DELETE",
  })
