import * as api from "./api"
import { toCamelCase, toSnakeCase } from "./case"

const basePath = `/v1/profile`

export interface Profile {
  userId: string
  email: string
  name?: string
  phoneNumber?: string
  picture?: string
}

export type ProfileCreateValues = Omit<Profile, "userId">
export type ProfileUpdateValues = Omit<Profile, "userId" | "email">

export const get = async (): Promise<Profile> => {
  const resp = await api.get<Profile>(basePath)
  return toCamelCase(resp)
}
export const create = async (data: ProfileCreateValues): Promise<Profile> => {
  const resp = await api.post<Profile, ProfileCreateValues>(basePath, toSnakeCase(data))
  return toCamelCase(resp)
}
export const update = async (data: ProfileUpdateValues): Promise<Profile> => {
  const resp = await api.patch<Profile, ProfileUpdateValues>(basePath, toSnakeCase(data))
  return toCamelCase(resp)
}
