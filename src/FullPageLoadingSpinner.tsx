import { EuiLoadingSpinner } from "@elastic/eui"
import React from "react"

export const FullPageLoadingSpinner: React.FC = () => (
  <div
    style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <EuiLoadingSpinner size="xl" style={{ width: "100px", height: "100px" }} />
  </div>
)
