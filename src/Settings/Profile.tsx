import React, { useState } from "react"
import { EuiButton, EuiButtonEmpty } from "@elastic/eui"

import Page from "../Page"

export const Profile: React.FC = () => {
  return (
    <>
      <h2>Profile</h2>
      <EuiButtonEmpty>Reset Password</EuiButtonEmpty>
    </>
  )
}
