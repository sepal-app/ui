import React, { useCallback, useEffect, useState } from "react"
import { useMutation, useQueryCache } from "react-query"
import "./App.css"
import Router from "./Router"
import { FullPageLoadingSpinner } from "./FullPageLoadingSpinner"
import { list as listOrganizations } from "./lib/organization"
import {
  ProfileCreateValues,
  create as createProfile,
  get as getProfile,
} from "./lib/profile"
import { useAuth } from "./lib/auth"

export const App: React.FC = () => {
  const [ready, setReady] = useState(false)
  const queryCache = useQueryCache()
  const prefetchOrganizations = useCallback(async () => {
    await queryCache.prefetchQuery("organizations", listOrganizations)
  }, [queryCache])
  const fetchProfile = useCallback(async () => {
    await queryCache.fetchQuery("profile", getProfile)
  }, [queryCache])
  const { loading, user } = useAuth()

  const [createProfileMutation] = useMutation((values: ProfileCreateValues) =>
    createProfile(values),
  )

  useEffect(() => {
    if (loading || !user) {
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
      .then(() => prefetchOrganizations())
      .catch((err) => {
        // this.notificationSvc.error("Search failed.");
        // TODO: handle error
        console.log(err)
      })
      .finally(() => setReady(true))
  }, [createProfileMutation, fetchProfile, loading, prefetchOrganizations, user])

  return ready ? <Router /> : <FullPageLoadingSpinner />
}
