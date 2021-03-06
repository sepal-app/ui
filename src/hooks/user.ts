import firebase from "firebase/app"
import { useMutation, useQueryClient } from "react-query"
import { list as listOrganizations, useCurrentOrganization } from "../lib/organization"
import {
  ProfileCreateValues,
  create as createProfile,
  get as getProfile,
} from "../lib/profile"

export const useInitUser = () => {
  const queryClient = useQueryClient()
  const [currentOrganization, setCurrentOrganization] = useCurrentOrganization()
  const fetchOrganizations = () =>
    queryClient.fetchQuery("organizations", listOrganizations)
  const fetchProfile = async () => queryClient.fetchQuery("profile", getProfile)
  const {
    mutateAsync: createProfileMutation,
  } = useMutation((values: ProfileCreateValues) => createProfile(values))

  return async (user: firebase.User) =>
    fetchProfile()
      .catch((err) => {
        if (err.status === 404) {
          if (user?.email) {
            return createProfileMutation({ email: user?.email })
          }
        } else {
          throw err
        }
      })
      .then(() => fetchOrganizations())
      .then((orgs) => {
        if (!currentOrganization && orgs) {
          setCurrentOrganization(orgs[0])
        }
      })
}
