import { BehaviorSubject, Observable } from "rxjs"

import * as api from "./api"
import { Organization } from "./organization"

const currentUserKey = "current_user"
const currentOrganizationKey = "current_organization"

export interface User {
  id: number
  firstName: string
  username: string
  email: string
  defaultOrganizationId: number

  organizations: Organization[]
}

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

async function create() {
  // TODO:
}

export const me = (): Observable<User> => {
  return api.get<User>("/v1/me/")
}

// export { create, me, useCurrentOrganization, useCurrentUser };
