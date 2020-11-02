import * as api from "./api"

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/locations`
}

export interface Location {
  id: number
  code: string
  name: string
  description: string
}

export type LocationFormValues = Pick<Location, "code" | "name" | "description">

export const { get, create, update } = api.makeResource<Location, LocationFormValues>(
  basePath,
)
