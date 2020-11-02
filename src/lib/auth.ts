import { currentOrganization$ } from "./organization"

let _accessToken: string | null = null

export const setAccessToken = (token: string | null): void => {
  _accessToken = token
}

export const getAccessToken = (): string | null => _accessToken

export const logout = () => {
  console.log("logout()")
  setAccessToken(null)
  // TODO: we need to call auth0 logout but its in a hook
  currentOrganization$.next(null)
}
