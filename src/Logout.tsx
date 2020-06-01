import React from "react"
import { useHistory } from "react-router-dom"
import { logout } from "./lib/auth"

export const Logout: React.FC = () => {
  const history = useHistory()
  logout()
  history.push("/")

  return (
    <div>
      Logging out...
      <a href="/login">Login</a>
    </div>
  )
}
