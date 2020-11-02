import React, { ComponentProps, ComponentType } from "react"
import { useQuery, useQueryCache } from "react-query"
import { Redirect, Route, Switch } from "react-router-dom"
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"

import { AccessionForm } from "./AccessionForm"
import { Home } from "./Home"
import { OrganizationForm } from "./OrganizationForm"
import { Search } from "./Search"
import { Settings } from "./Settings"
import { TaxonForm } from "./TaxonForm"
import { LocationForm } from "./LocationForm"
import { Organization, list as listOrganizations } from "./lib/organization"

const Loading = () => <div>Redirecting to login...</div>

const PrivateRoute: React.FC<ComponentProps<typeof Route>> = ({
  component,
  path,
  ...args
}) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const queryCache = useQueryCache()
  const { data: orgs } = useQuery("organizations", listOrganizations)

  if (!isAuthenticated) {
    console.log("Redirect to /login")
    loginWithRedirect()
    return null
  }

  if (!orgs?.length && path !== "/organization") {
    return <Redirect from={path as string} to={`/organization?redirect=${path}`} />
  }

  return (
    <Route
      component={withAuthenticationRequired(component as ComponentType, {
        onRedirecting: () => <Loading />,
      })}
      path={path}
      {...args}
    />
  )
}

const Router: React.FC = () => {
  return (
    <Switch>
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
