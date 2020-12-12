import firebase from "firebase/app"
import "firebase/auth"
import React from "react"

export const FirebaseAuthProvider: React.FC = ({ children }) => {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.REACT_APP_PROJECT_ID,
  }
  firebase.initializeApp(firebaseConfig)
  return <>{children}</>
}
