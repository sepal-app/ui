import React, { useState, ChangeEvent } from "react";
import { useHistory } from "react-router-dom";
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiText
} from "@elastic/eui";

import * as api from "./lib/api";

const Login: React.FC = () => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const history = useHistory();

  function handleSubmit() {
    api
      .login(username, password)
      .then(resp => {
        console.log(resp);
        history.push("/search");
      })
      .catch(e => {
        // TODO: handle error
        console.log(e);
      });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    // TODO: handle submit on enter
  }

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem style={{ alignItems: "center" }}>
          <EuiForm
            style={{ padding: "2rem", minWidth: "400px" }}
            onSubmit={handleSubmit} // TODO: onSubmit doesn't work on EuiForm
          >
            <EuiText>
              <p style={{ marginBottom: "0" }}>Welcome to</p>
              <h1 style={{ marginTop: "0" }}>Sepal</h1>
            </EuiText>
            <EuiFormRow label="User" style={{ marginTop: "1rem" }}>
              <EuiFieldText
                name="username"
                onChange={e => setUsername(e.target.value)}
              />
            </EuiFormRow>
            <EuiFormRow label="Password">
              <EuiFieldPassword
                name="password"
                onChange={e => setPassword(e.target.value)}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiButton type="submit" fill onClick={handleSubmit}>
              Sign In
            </EuiButton>
          </EuiForm>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <div className="Login--splash-img" style={{ minHeight: "100vh" }}>
            {" "}
            &nbsp;
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default Login;
