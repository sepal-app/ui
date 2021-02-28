import * as api from "./api"

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/activity`
}

export interface Activity {
  description: string
}

export const list = async (orgId: number): Promise<Activity[]> =>
  await api.get<Activity[]>(basePath(orgId))
