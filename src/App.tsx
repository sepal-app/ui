import React, { useEffect, useState } from "react"
import { useQueryCache } from "react-query"
import { useAuth0 } from "@auth0/auth0-react"
import { EuiLoadingSpinner } from "@elastic/eui"
import "./App.css"
import Router from "./Router"
import { list as listOrganizations } from "./lib/organization"
import { setAccessToken } from "./lib/auth"

const App: React.FC = () => {
  console.log("entered App()")
  const { error, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [ready, setReady] = useState(false)
  const queryCache = useQueryCache()
  const prefetchOrganizations = async () => {
    await queryCache.prefetchQuery("organizations", listOrganizations)
  }

  useEffect(() => {
    // TODO: handle useAuth0 error
    // TODO: if we logout here we get in an infinite loop
    // history.replace("/logout")
    console.log(error)
  }, [error])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // We're done trying to authenticate but it didn't work
      setReady(true)
    } else if (!isAuthenticated) {
      // Not authenticated yet but still loading
      return
    }

    console.log("getToken()")
    getAccessTokenSilently()
      .then((token) => setAccessToken(token))
      .then(() => prefetchOrganizations())
      .catch((err) => {
        // this.notificationSvc.error("Search failed.");
        // TODO: handle error
        console.log(err)
      })
      .finally(() => setReady(true))
  }, [error, getAccessTokenSilently, isAuthenticated, isLoading])

  if (!ready) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EuiLoadingSpinner size="xl" style={{ width: "100px", height: "100px" }} />
      </div>
    )
  }

  return <Router />
}

export default App
