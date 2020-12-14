import React, { useEffect, useState } from "react"
import "./App.css"
import Router from "./Router"
import { FullPageLoadingSpinner } from "./FullPageLoadingSpinner"
import {
  ProfileCreateValues,
  create as createProfile,
  get as getProfile,
} from "./lib/profile"
import { useAuth } from "./lib/auth"
import { useInitUser } from "./hooks"

export const App: React.FC = () => {
  const [ready, setReady] = useState(false)
  const { loading, user } = useAuth()
  const initUser = useInitUser()

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

    initUser(user)
      .catch((err) => {
        // this.notificationSvc.error("Search failed.");
        // TODO: handle error
        console.log(err)
      })
      .finally(() => setReady(true))
  }, [initUser, loading, user])

  return ready ? <Router /> : <FullPageLoadingSpinner />
}
