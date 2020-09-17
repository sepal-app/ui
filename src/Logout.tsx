import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

export const Logout: React.FC = () => {
  const { logout } = useAuth0()
  console.log("Logout()")
  logout({ returnTo: window.location.origin.concat("/login") })

  return (
    <div>
      Logging out...
      <a href="/login">Login</a>
    </div>
  )
}
