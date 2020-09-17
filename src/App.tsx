import React, { useEffect, useState } from "react"
import { tap } from "rxjs/operators"
import { EuiLoadingSpinner, EuiPage, EuiPageBody, EuiPageContent } from "@elastic/eui"

import "./App.css"
import Router from "./Router"
import { organizations$ } from "./lib/user"
import { useAuth0 } from "@auth0/auth0-react"
import * as OrganizationService from "./lib/organization"
import { accessToken$ } from "./lib/auth"

const App: React.FC = () => {
  console.log("entered App()")
  const { error, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // TODO: handle useAuth0 error
    console.log(error)
  }, [error])

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setReady(false)
      return
    }

    // TODO: either the organization list needs to be promisified or the
    // getAccessTokenSilently needs to be turned into an observable so we can
    // setReady in the finally block
    getAccessTokenSilently()
      .then((token) => accessToken$.next(token))
      .then(() => console.log("got token"))
      .then(() =>
        // update organizations
        OrganizationService.list()
          .pipe(
            tap((orgs) => console.log(orgs)),
            tap((orgs) => organizations$.next(orgs)),
            tap(() => setReady(true)),
          )
          .subscribe(),
      )
      .catch((e) => console.log(e))
  }, [isAuthenticated, isLoading])

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
