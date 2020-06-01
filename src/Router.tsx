import React from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { useObservableState } from "observable-hooks"

import { Login } from "./Login"
import { Logout } from "./Logout"
import { Home } from "./Home"
import { Search } from "./Search"
import { TaxonForm } from "./TaxonForm"
import { AccessionForm } from "./AccessionForm"
import { isLoggedIn$ } from "./lib/auth"

const PrivateRoute = ({ component, ...rest }: any) => {
  const isLoggedIn = useObservableState(isLoggedIn$)
  return isLoggedIn ? (
    <Route {...rest} component={component} />
  ) : (
    <Redirect to={{ pathname: "/login" }} />
  )
}

const Router: React.FC = () => {
  return (
    <Switch>
      <PrivateRoute exact path="/logout" component={Logout} />
      <PrivateRoute exact path="/search" component={Search} />
      <PrivateRoute exact path="/taxon/:id" component={TaxonForm} />
      <PrivateRoute exact path="/taxon" component={TaxonForm} />
      <PrivateRoute exact path="/accession/:id" component={AccessionForm} />
      <PrivateRoute exact path="/accession" component={AccessionForm} />
      <PrivateRoute exact path="/" component={Home} />
      <Route path="/login" component={Login} />
    </Switch>
  )
}

export default Router
