import { BehaviorSubject, Observable, from } from "rxjs"
import { ajax } from "rxjs/ajax"
import { map, switchMap, tap } from "rxjs/operators"
import { toSnakeCase } from "./case"

import { currentUser$, currentOrganization$ } from "./user"

const baseUrl = process.env.REACT_APP_AUTH0_API_URL as string

const accessTokenKey = "access_token"
const refreshTokenKey = "refresh_token"

interface SignupData {
  username: string
  email: string
  password: string
  given_name: string
  family_name: string
}

export const accessToken$ = new BehaviorSubject<string | null>(null)

export const refreshToken$ = new BehaviorSubject<string | null>(null)

export const isLoggedIn$ = accessToken$.pipe(map((value) => !!value))

export const login = (username: string, password: string): Observable<any> => {
  const url = baseUrl.concat("/o/token/")
  const data = new FormData()
  data.set("username", username)
  data.set("password", password)
  // data.set("client_id", sepalClientId)
  // data.set("client_secret", sepalClientSecret)
  data.set("grant_type", "password")
  // data.set("scope", "read write admin")

  return from(
    fetch(url, {
      method: "POST",
      body: data,
    }),
  ).pipe(
    map((resp) => {
      if (!resp.ok) throw resp
      return resp
    }),
    switchMap((r) => r.json()),
    tap((json) => {
      accessToken$.next(json.access_token)
      refreshToken$.next(json.refresh_token)
    }),
  )
}

export const logout = () => {
  console.log("logout()")
  accessToken$.next(null)
  refreshToken$.next(null)
  currentUser$.next(null)
  currentOrganization$.next(null)
}

export const signup = (body: SignupData): Observable<any> => {
  // TODO: should we create the organization here in the same function
  return ajax({
    url: `${baseUrl}/dbconnections/signup`,
    method: "POST",
    body: {
      connection: "CONNECTION",
      ...toSnakeCase(body),
    },
  })
}
