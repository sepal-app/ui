import { BehaviorSubject, Observable, from } from "rxjs"
import { ajax } from "rxjs/ajax"
import { map, switchMap, tap } from "rxjs/operators"
import { toSnakeCase } from "./case"

import { currentUser$, currentOrganization$ } from "./user"

// const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string
// const sepalClientId = process.env.REACT_APP_SEPAL_CLIENT_ID as string
// const sepalClientSecret = process.env.REACT_APP_SEPAL_CLIENT_SECRET as string

const baseUrl = process.env.REACT_APP_AUTH0_API_URL as string
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID as string
// const sepalClientSecret = process.env.REACT_APP_SEPAL_CLIENT_SECRET as string

const accessTokenKey = "access_token"
const refreshTokenKey = "refresh_token"

interface SignupData {
  username: string
  email: string
  password: string
  given_name: string
  family_name: string
}

export const accessToken$ = new BehaviorSubject<string | null>(
  localStorage.getItem(accessTokenKey) ?? "",
)

accessToken$.subscribe(value => {
  if (value) {
    localStorage.setItem(accessTokenKey, value)
  } else {
    localStorage.removeItem(accessTokenKey)
  }
})

export const refreshToken$ = new BehaviorSubject<string | null>(
  localStorage.getItem(refreshTokenKey) ?? "",
)

refreshToken$.subscribe(value => {
  if (value) {
    localStorage.setItem(refreshTokenKey, value)
  } else {
    localStorage.removeItem(refreshTokenKey)
  }
})

export const isLoggedIn$ = accessToken$.pipe(map(value => !!value))

export const login = (username: string, password: string): Observable<any> => {
  const url = baseUrl.concat("/o/token/")
  const data = new FormData()
  data.set("username", username)
  data.set("password", password)
  data.set("client_id", sepalClientId)
  data.set("client_secret", sepalClientSecret)
  data.set("grant_type", "password")
  // data.set("scope", "read write admin")

  return from(
    fetch(url, {
      method: "POST",
      body: data,
    }),
  ).pipe(
    map(resp => {
      if (!resp.ok) throw resp
      return resp
    }),
    switchMap(r => r.json()),
    tap(json => {
      accessToken$.next(json.access_token)
      refreshToken$.next(json.refresh_token)
    }),
  )
}

export const logout = () => {
  accessToken$.next(null)
  refreshToken$.next(null)
  currentUser$.next(null)
  currentOrganization$.next(null)
}

export const signup = (body: SignupData): Observable<any> => {
  // TODO: should we create the organization here in the same function
  ajax({
    url: `${baseUrl}/dbconnections/signup`,
    method: "POST",
    body: {
      connection: "CONNECTION",
      ...toSnakeCase(body),
    },
  })
}
