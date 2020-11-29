import React from "react"
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiTitle } from "@elastic/eui"

export const Profile: React.FC = () => {
  return (
    <>
      <EuiTitle size="m">
        <h2>Profile</h2>
      </EuiTitle>

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiButtonEmpty>Reset Password</EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}
