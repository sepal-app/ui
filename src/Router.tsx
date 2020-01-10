import React from "react";
import { Switch, Route } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import Home from "./Home";
import Search from "./Search";

const Router: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/logout">
        <Logout />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
};

export default Router;
