import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { EMPTY, from } from "rxjs"
import { catchError, finalize, switchMap, tap } from "rxjs/operators"
import { EuiLoadingSpinner } from "@elastic/eui"
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
  // const history = useHistory()

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

    // getAccessTokenSilently().then((token) => console.log("xxx - got-token"))
    // TODO: either the organization list needs to be promisified or the
    // getAccessTokenSilently needs to be turned into an observable so we can
    // setReady in the finally block
    const subscription = from(getAccessTokenSilently())
      .pipe(
        tap((token) => accessToken$.next(token)),
        switchMap(() => OrganizationService.list()),
        tap((orgs) => organizations$.next(orgs)),
        catchError((err) => {
          // this.notificationSvc.error("Search failed.");
          // TODO: handle error
          console.log(err)
          return EMPTY
        }),
        finalize(() => setReady(true)),
      )
      .subscribe()

    return () => subscription.unsubscribe()
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
