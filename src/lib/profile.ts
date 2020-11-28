import * as api from "./api"

const basePath = `/v1/profile`

export interface Profile {
  user_id: string
  email: string
  name?: string
  phone_number?: string
  picture?: string
}

export type ProfileCreateValues = Omit<Profile, "user_id">
export type ProfileUpdateValues = Omit<Profile, "user_id" | "email">

export const get = async (): Promise<Profile> => {
  return api.get<Profile>(basePath)
}
export const create = async (data: ProfileCreateValues): Promise<Profile> => {
  return api.post<Profile, ProfileCreateValues>(basePath, data)
}
export const update = async (data: ProfileUpdateValues): Promise<Profile> => {
  return api.patch<Profile, ProfileUpdateValues>(basePath, data)
}
