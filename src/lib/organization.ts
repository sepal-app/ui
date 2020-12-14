import { BehaviorSubject } from "rxjs"
import * as api from "./api"

const basePath = "/v1/orgs"
const currentOrganizationKey = "current_organization"

export interface Organization {
  id: number
  name: string
  shortName: string
  abbreviation: string
}

const initialOrganizationData = localStorage.getItem(currentOrganizationKey)

export const currentOrganization$ = new BehaviorSubject<Organization | null>(
  initialOrganizationData ? JSON.parse(initialOrganizationData) : null,
  // : initialUserData
  // ? JSON.parse(initialUserData).organizations?.[0]
  // : null,
)

currentOrganization$.subscribe((value) => {
  if (value) {
    localStorage.setItem(currentOrganizationKey, JSON.stringify(value))
  } else {
    localStorage.removeItem(currentOrganizationKey)
  }
})

export type OrganizationFormValues = Pick<
  Organization,
  "name" | "shortName" | "abbreviation"
>

export const list = async (): Promise<Organization[]> =>
  await api.get<Organization[]>(basePath)

export const get = async (
  id: number,
  options?: { expand?: string[]; include?: string[] },
): Promise<Organization> => {
  const params = new URLSearchParams()
  if (options && !!options.expand) {
    params.append("expand", options.expand.join(","))
  }
  if (options && !!options.include) {
    params.append("include", options.include.join(","))
  }
  const queryParams = "?".concat(params.toString())
  const path = [basePath, id, queryParams].join("/")
  return await api.get(path)
}

export const create = async (data: OrganizationFormValues): Promise<Organization> =>
  await api.post<Organization, OrganizationFormValues>(basePath, data)

export const update = async (
  id: number,
  data: OrganizationFormValues,
): Promise<Organization> => {
  const path = [basePath, id].join("/").concat("/")
  return await api.patch<Organization, OrganizationFormValues>(path, data)
}

export const users = async (id: number): Promise<Organization[]> => {
  const path = [basePath, id, "users"].join("/")
  return await api.get<Organization[]>(path)
}

export const invite = async (id: number, emails: string[]): Promise<Response> => {
  const path = [basePath, id, "invite"].join("/")
  return api.post(path, { emails })
}
