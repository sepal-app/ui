import React from "react"
import ReactDOM from "react-dom"
import "./index.scss"
import App from "./App"
import { QueryCache, ReactQueryCacheProvider } from "react-query"

import { BrowserRouter } from "react-router-dom"
import { Auth0ProviderWithHistory } from "./Auth0ProviderWithHistory"

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      // By default we pass the name of the route as the first
      // parameter of the query key if we pass an array as the query key so
      // filter the name out so it doesn't get passed to the function
      queryFnParamsFilter: (args) => (Array.isArray(args) ? args.slice(1) : args),

      // Refetching on focus caused some weird issues where if we selected a search item
      // to show the summary box and then unfocused the window and then
      // refocused and selected the same item then the summary box would disappear. This
      // probably happens b/c the item that was passed to the summary box becomes null
      // but either way it was strange and hard to fix.
      refetchOnWindowFocus: false,

      // TODO: should we set a default query function to call `/v1/` and then
      // when we do useQuery we pass the pull path to the route, e.g.
      // useQuery(['accessions', accessionId, 'items'])
      // ...what would probably be better would be to have separate hooks like
      // useAccessionQuery(), useAccessionMutation() that passes the correct args for the query key
      // and filters the params
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <App />
        </ReactQueryCacheProvider>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root"),
)
