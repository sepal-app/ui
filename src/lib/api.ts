import { toCamelCase, toSnakeCase } from "./case"
import { getAccessToken, logout } from "./auth"

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
  include?: string[]
}

export type ListResponse<T> = T[] & { nextCursor: string | null }

export const makeResource = <T, F>(pathTemplate: (orgId: string | number) => string) => ({
  list: async (
    orgId: string | number,
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

    let url: string | null = [
      baseUrl.concat(pathTemplate(orgId)),
      params.toString(),
    ].join("?")

    const resp = await request(url)
    const respData = await resp.json()
    const nextPageUrl = getNextLink(resp.headers)
    // return [respData, nextPageUrl]
    const nextCursor = nextPageUrl
      ? new URL(nextPageUrl).searchParams.get("cursor")
      : null
    // return { data: respData, nextCursor }
    console.log(`nextPageUrl: ${nextPageUrl}`)
    console.log(`nextCursor: ${nextCursor}`)
    respData.nextCursor = nextCursor
    return respData
  },

  get: async (
    orgId: string | number,
    id: string | number,
    options?: { include?: string[] },
  ): Promise<T> => {
    const params = new URLSearchParams()
    if (options && !!options.include) {
      params.append("include", options.include.join(","))
    }
    const queryParams = "?".concat(params.toString())
    const path = [pathTemplate(orgId), id].join("/").concat(queryParams)
    return get<T>(path)
  },

  create: async (orgId: string | number, data: F): Promise<T> => {
    const path = pathTemplate(orgId)
    return post<T, F>(path, data)
  },

  update: async (orgId: string | number, id: string | number, data: F): Promise<T> => {
    const path = [pathTemplate(orgId), id].join("/")
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

const request = async (url: string, options?: RequestInit): Promise<Response> => {
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
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

export const post = async <T, K>(path: string, data: K): Promise<T> => {
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
