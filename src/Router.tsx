import React from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { useObservableState } from "observable-hooks"

import { AccessionForm } from "./AccessionForm"
import { Home } from "./Home"
import { Login } from "./Login"
import { Logout } from "./Logout"
import { OrganizationForm } from "./OrganizationForm"
import { Search } from "./Search"
import { Settings } from "./Settings"
import { Signup } from "./Signup"
import { TaxonForm } from "./TaxonForm"
import { isLoggedIn$ } from "./lib/auth"
import { currentUser$ } from "./lib/user"

const PrivateRoute = ({ component, ...rest }: any) => {
  const isLoggedIn = useObservableState(isLoggedIn$)
  const user = useObservableState(currentUser$)
  const hasOrgs = user?.organizations?.length ?? false
  const path = rest.path

  if (!isLoggedIn) {
    return <Redirect to={{ pathname: "/login" }} />
  }

  if (!hasOrgs && path !== "/organization") {
    return <Redirect from={path} to={`/organization?redirect=${path}`} />
  }

  return <Route {...rest} component={component} />
}

const Router: React.FC = () => {
  return (
    <Switch>
      <PrivateRoute exact path="/search" component={Search} />
      <PrivateRoute exact path="/taxon/:id" component={TaxonForm} />
      <PrivateRoute exact path="/taxon" component={TaxonForm} />
      <PrivateRoute exact path="/accession/:id" component={AccessionForm} />
      <PrivateRoute exact path="/accession" component={AccessionForm} />
      <PrivateRoute exact path="/organization/:id" component={OrganizationForm} />
      <PrivateRoute exact path="/organization" component={OrganizationForm} />
      <PrivateRoute exact path="/settings" component={Settings} />
      <PrivateRoute exact path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/logout" component={Logout} />
    </Switch>
  )
}

export default Router
