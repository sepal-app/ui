import React from "react";
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
import { Form, Formik } from "formik";

import * as api from "./lib/api";
import { me, useCurrentUser } from "./lib/user";

interface LoginValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [, setCurrentUser] = useCurrentUser();
  const history = useHistory();

  function handleSubmit(values: LoginValues) {
    api
      .login(values.username, values.password)
      .then(() => me())
      .then(user => setCurrentUser(user))
      .then(() => history.push("/search"))
      .catch(e => {
        // TODO: handle error
        console.log(e);
      });
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ username: "", password: "" }}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange }) => (
        <Form>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem style={{ alignItems: "center" }}>
              <EuiForm
                style={{ padding: "2rem", minWidth: "400px" }}
                component="form"
              >
                <EuiText>
                  <p style={{ marginBottom: "0" }}>Welcome to</p>
                  <h1 style={{ marginTop: "0" }}>Sepal</h1>
                </EuiText>
                <EuiFormRow label="User" style={{ marginTop: "1rem" }}>
                  <EuiFieldText
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="Password">
                  <EuiFieldPassword
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiButton type="submit" fill>
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
        </Form>
      )}
    </Formik>
  );
};

export default Login;
