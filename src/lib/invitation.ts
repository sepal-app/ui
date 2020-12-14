import * as api from "./api"

const basePath = "/v1/invitations"

export const accept = async (invitation: string): Promise<Response> => {
  const url = api.baseUrl.concat([basePath, invitation, "accept"].join("/"))
  return await api.request(url, { method: "POST" })
}
