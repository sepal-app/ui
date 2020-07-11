import { Observable } from "rxjs"

import * as api from "./api"

const basePath = `/v1/orgs/`

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

export const get = (
  id: string | number,
  options?: { expand?: string[]; include?: string[] },
): Observable<Organization> => {
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

export const create = (data: OrganizationFormValues): Observable<Organization> => {
  return api.post<Organization, OrganizationFormValues>(basePath, data)
}

export const update = (
  id: string | number,
  data: OrganizationFormValues,
): Observable<Organization> => {
  const path = [basePath, id].join("/").concat("/")
  return api.patch<Organization, OrganizationFormValues>(path, data)
}
