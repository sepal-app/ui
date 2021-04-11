import * as api from "./api"

function basePath(orgId: string) {
  return `/v1/orgs/${orgId}/activity`
}

export interface Activity {
  description: string
}

export const list = async (orgId: string): Promise<Activity[]> =>
  await api.get<Activity[]>(basePath(orgId))
