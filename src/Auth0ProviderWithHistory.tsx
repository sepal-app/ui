import React from "react"
import { useHistory } from "react-router-dom"
import { Auth0Provider } from "@auth0/auth0-react"

export const Auth0ProviderWithHistory: React.FC = ({ children }) => {
  const history = useHistory()
  const domain = process.env.REACT_APP_AUTH0_DOMAIN
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE

  const onRedirectCallback = (appState: any) => {
    history.push(appState?.returnTo || window.location.pathname)
  }

  return (
    <Auth0Provider
      domain={domain as string}
      clientId={clientId as string}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
      // TODO: we need a proper scope
      // scope="openid email profile offline_access"
      // scope="openid email profile"
      audience={audience as string}
    >
      {children}
    </Auth0Provider>
  )
}
