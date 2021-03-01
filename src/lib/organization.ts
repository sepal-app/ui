import { useQueryClient } from "react-query"
import * as api from "./api"

const basePath = "/v1/orgs"
const currentOrganizationKey = "current_organization"

export interface Organization {
  id: number
  name: string
  shortName: string
  abbreviation: string
}

export type OrganizationFormValues = Pick<
  Organization,
  "name" | "shortName" | "abbreviation"
>

export const useCurrentOrganization = (): [Organization, (org: Organization) => void] => {
  const queryClient = useQueryClient()
  const org = queryClient.getQueryData("currentOrganization")
  if (!org) {
    const initialData = localStorage.getItem(currentOrganizationKey)
    if (initialData) {
      queryClient.setQueryData("currentOrganization", JSON.parse(initialData))
    }
  }
  const setter = (value: Organization) => {
    queryClient.setQueryData("currentOrganization", value)
  }

  // TODO: don't force type, just make sure it exists
  return [org as Organization, setter]
}

export const list = async (): Promise<Organization[]> =>
  await api.get<Organization[]>(basePath)

export const get = async (
  id: string | number,
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
