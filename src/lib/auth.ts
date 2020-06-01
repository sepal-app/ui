import { BehaviorSubject, Observable, from } from "rxjs"
import { map, switchMap, tap } from "rxjs/operators"

import { currentUser$, currentOrganization$ } from "./user"

const baseUrl = process.env.REACT_APP_SEPAL_API_URL as string
const sepalClientId = process.env.REACT_APP_SEPAL_CLIENT_ID as string
const sepalClientSecret = process.env.REACT_APP_SEPAL_CLIENT_SECRET as string

const accessTokenKey = "access_token"
const refreshTokenKey = "refresh_token"

export const accessToken$ = new BehaviorSubject<string | null>(
  localStorage.getItem(accessTokenKey) ?? "",
)

accessToken$.subscribe((value) => {
  if (value) {
    localStorage.setItem(accessTokenKey, value)
  } else {
    localStorage.removeItem(accessTokenKey)
  }
})

export const refreshToken$ = new BehaviorSubject<string | null>(
  localStorage.getItem(refreshTokenKey) ?? "",
)

refreshToken$.subscribe((value) => {
  if (value) {
    localStorage.setItem(refreshTokenKey, value)
  } else {
    localStorage.removeItem(refreshTokenKey)
  }
})

export const isLoggedIn$ = accessToken$.pipe(map((value) => !!value))

export const login = (username: string, password: string): Observable<any> => {
  const url = baseUrl.concat("/o/token/")
  const data = new FormData()
  data.set("username", username)
  data.set("password", password)
  data.set("client_id", sepalClientId)
  data.set("client_secret", sepalClientSecret)
  data.set("grant_type", "password")
  data.set("scope", "read write admin")

  return from(
    fetch(url, {
      method: "POST",
      body: data,
    }),
  ).pipe(
    switchMap((r) => r.json()),
    tap((json) => {
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
