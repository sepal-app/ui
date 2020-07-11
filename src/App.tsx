import React, { useEffect } from "react";

import "./App.css";
import Router from "./Router";
import { me } from "./lib/user";
// import { useCurrentUser } from "./lib/user";

const App: React.FC = () => {
  console.log("entered App()");
  // const [, setCurrentUser] = useCurrentUser();
  // useEffect(() => {
  //   me()
  //     .then(user => setCurrentUser(user))
  //     /* .then(() => history.push("/search")) */
  //     .catch(e => {
  //       // TODO: handle error
  //       console.log(e);
  //     });
  // });
  //
  return <Router />;
};

export default App;
