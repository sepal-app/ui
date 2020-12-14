import React, { useCallback, useEffect, useState } from "react"
import { useMutation, useQueryCache } from "react-query"
import "./App.css"
import Router from "./Router"
import { FullPageLoadingSpinner } from "./FullPageLoadingSpinner"
import { currentOrganization$, list as listOrganizations } from "./lib/organization"
import {
  ProfileCreateValues,
  create as createProfile,
  get as getProfile,
} from "./lib/profile"
import { useAuth } from "./lib/auth"

export const App: React.FC = () => {
  const [ready, setReady] = useState(false)
  const queryCache = useQueryCache()
  const fetchOrganizations = () =>
    queryCache.fetchQuery("organizations", listOrganizations)
  const fetchProfile = async () => queryCache.fetchQuery("profile", getProfile)
  const { loading, user } = useAuth()

  const [createProfileMutation] = useMutation((values: ProfileCreateValues) =>
    createProfile(values),
  )

  useEffect(() => {
    if (loading) {
      return
    }

    if (!loading && !user) {
      // not logged in
      setReady(true)
      return
    }

    if (!user) {
      // TODO: it seems like typescript wouldn't need this guard b/c of the
      // previous conditional?
      return
    }

    fetchProfile()
      .catch((err) => {
        if (err.status === 404) {
          const { email } = user
          if (email) {
            return createProfileMutation({ email })
          }
        } else {
          throw err
        }
      })
      .then(() => fetchOrganizations())
      .then((orgs) => {
        if (!currentOrganization$.value && orgs) {
          currentOrganization$.next(orgs[0])
        }
      })
      .catch((err) => {
        // this.notificationSvc.error("Search failed.");
        // TODO: handle error
        console.log(err)
      })
      .finally(() => setReady(true))
  }, [createProfileMutation, fetchProfile, loading, fetchOrganizations, user])

  return ready ? <Router /> : <FullPageLoadingSpinner />
}
