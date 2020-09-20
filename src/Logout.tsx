import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

export const Logout: React.FC = () => {
  console.log("Logout()")
  const { logout } = useAuth0()
  logout({ returnTo: window.location.origin.concat("/login") })

  return (
    <div>
      Logging out...
      <a href="/login">Login</a>
    </div>
  )
}
