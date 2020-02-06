import React from "react";
import { useHistory } from "react-router-dom";
import * as api from "./lib/api";

const Logout: React.FC = () => {
  const history = useHistory();
  api.logout();
  history.push("/");

  return (
    <div>
      Logging out...
      <a href="/login">Login</a>
    </div>
  );
};

export default Logout;
