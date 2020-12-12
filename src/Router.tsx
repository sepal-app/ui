import React, { ComponentProps, ComponentType } from "react"
import { useQuery } from "react-query"
import { Redirect, Route, Switch, useHistory } from "react-router-dom"

import { AccessionForm } from "./AccessionForm"
import { Home } from "./Home"
import { OrganizationForm } from "./OrganizationForm"
import { Search } from "./Search"
import { Settings } from "./Settings"
import { TaxonForm } from "./TaxonForm"
import { LocationForm } from "./LocationForm"
import { Login } from "./Login"
import { Logout } from "./Logout"
import { list as listOrganizations } from "./lib/organization"
import { Register } from "./Register"
import { useAuth } from "./lib/auth"

const PrivateRoute: React.FC<ComponentProps<typeof Route>> = ({
  component,
  path,
  ...args
}) => {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const history = useHistory()
  // TODO: make sure we're looking in the cache here so we don't reload the
  // organiations on every route change
  const { data: orgs } = useQuery("organizations", listOrganizations)

  if (!isAuthenticated) {
    console.log("Redirect to /login")
    history.replace("/login")
    return null
  }

  if (!orgs?.length && path !== "/organization") {
    console.log("Redirect to /organization")
    return <Redirect from={path as string} to={`/organization?redirect=${path}`} />
  }

  return <Route component={component} path={path} {...args} />
}

const Router: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/register" component={Register} />
      <PrivateRoute exact path="/search" component={Search} />
      <PrivateRoute exact path="/taxon/:id" component={TaxonForm} />
      <PrivateRoute exact path="/taxon" component={TaxonForm} />
      <PrivateRoute exact path="/accession/:id" component={AccessionForm} />
      <PrivateRoute exact path="/accession" component={AccessionForm} />
      <PrivateRoute exact path="/location" component={LocationForm} />
      <PrivateRoute exact path="/location/:id" component={LocationForm} />
      <PrivateRoute exact path="/organization/:id" component={OrganizationForm} />
      <PrivateRoute exact path="/organization" component={OrganizationForm} />
      <PrivateRoute exact path="/settings" component={Settings} />
      <PrivateRoute exact path="/" component={Home} />
    </Switch>
  )
}

export default Router
