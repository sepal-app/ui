import { BehaviorSubject, Observable } from "rxjs"

import * as api from "./api"
import { Organization } from "./organization"

const currentUserKey = "current_user"
const currentOrganizationKey = "current_organization"

const basePath = `/users/`

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  defaultOrganizationId: number

  // organizations: Organization[]
}

export type UserFormValues = Pick<User, "username" | "email" | "firstName" | "lastName">

export type UserCreateFormValues = UserFormValues & { password: string }

const initialUserData = localStorage.getItem(currentUserKey)

export const currentUser$ = new BehaviorSubject<User | null>(
  initialUserData ? JSON.parse(initialUserData) : null,
)

currentUser$.subscribe((value) => {
  if (value) {
    localStorage.setItem(currentUserKey, JSON.stringify(value))
  } else {
    localStorage.removeItem(currentUserKey)
  }
})

export const organizations$ = new BehaviorSubject<Organization[]>([])

const initialOrganizationData = localStorage.getItem(currentOrganizationKey)

export const currentOrganization$ = new BehaviorSubject<Organization | null>(
  initialOrganizationData
    ? JSON.parse(initialOrganizationData)
    : initialUserData
    ? JSON.parse(initialUserData).organizations?.[0]
    : null,
)

currentOrganization$.subscribe((value) => {
  if (value) {
    localStorage.setItem(currentOrganizationKey, JSON.stringify(value))
  } else {
    localStorage.removeItem(currentOrganizationKey)
  }
})

export const me = (): Observable<User> => {
  return api.get<User>("/v1/me/")
}

export const get = (
  id: string | number,
  options?: { expand?: string[]; include?: string[] },
): Observable<User> => {
  const params = new URLSearchParams()
  if (options && !!options.expand) {
    params.append("expand", options.expand.join(","))
  }
  if (options && !!options.include) {
    params.append("include", options.include.join(","))
  }
  const queryParams = "?".concat(params.toString())
  const path = [basePath, id, queryParams].join("/")
  return api.get(path)
}

// export const create = (data: UserCreateFormValues): Observable<User> => {
//   return api.post<User, UserFormValues>(basePath, data)
//   // TODO: send confirm email email
// }

export const update = (id: string | number, data: UserFormValues): Observable<User> => {
  const path = [basePath, id].join("/").concat("/")
  return api.patch<User, UserFormValues>(path, data)
}

export const resetPassword = () => {
  // TODO: send reset password email
}
