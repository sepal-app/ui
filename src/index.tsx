import React from "react"
import ReactDOM from "react-dom"
import "./index.scss"
import { App } from "./App"
import { QueryClientProvider } from "react-query"

import { BrowserRouter } from "react-router-dom"
import { FirebaseAuthProvider } from "./FirebaseAuthProvider"
import { queryClient } from "./cache"

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <FirebaseAuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </FirebaseAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root"),
)
