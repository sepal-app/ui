import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import { logout } from "./lib/auth"

export const Logout: React.FC = () => {
  console.log("Logout()")
  const history = useHistory()

  logout()

  useEffect(() => {
    setTimeout(() => {
      history.replace("/login")
    }, 1000)
  }, [])

  return (
    <div>
      Logging out...
      <a href="/login">Login</a>
    </div>
  )
}
