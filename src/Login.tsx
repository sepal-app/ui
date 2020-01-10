import React, { useState, ChangeEvent } from "react";
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiTitle
} from "@elastic/eui";
import splashImage from "./assets/images/jose-fontano-WVAVwZ0nkSw-unsplash_1080x1620.jpg";

const Login: React.FC = () => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  function handleSubmit(event: any) {
    // SubmitEvent) {
    console.log("Submit");
    /* const form = event.target;
     * const formData = new FormData(form);
     * console.log(formData); */
    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
    console.log(`x: ${password}`);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    /* console.log(`name: ${name}`);
     * console.log(`value: ${value}`); */
    /* setter(event.target.value); */
  }

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem style={{ alignItems: "center" }}>
          <EuiForm style={{ padding: "2rem", minWidth: "400px" }}>
            <EuiText>
              <p style={{ marginBottom: "0" }}>Welcome to</p>
              <h1 style={{ marginTop: "0" }}>Sepal</h1>
            </EuiText>
            <EuiFormRow label="User" style={{ marginTop: "1rem" }}>
              <EuiFieldText name="username" />
            </EuiFormRow>
            <EuiFormRow label="Password">
              <EuiFieldPassword name="password" />
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
    </>
  );
};

export default Login;
