import firebase from "firebase/app"
import { useEffect, useState } from "react"
import { queryClient } from "../cache"

export const useAuth = () => {
  const auth = firebase.auth()
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // return so the effect will unsubscribe
    return auth.onAuthStateChanged((user) => {
      console.log("-- auth state changed --")
      setUser(user)
      setLoading(false)
    })
  }, [])

  return {
    user,
    loading,
    // TODO: Probably don't need login here. It was just left over from when we
    // were trying to get the state management working
    login: (email: string, password: string) =>
      auth.signInWithEmailAndPassword(email, password),
    sendPasswordResetEmail: (email: string) => auth.sendPasswordResetEmail(email),
  }
}

export const signup = async (email: string, password: string) => {
  return await firebase.auth().createUserWithEmailAndPassword(email, password)
}

export const logout = async () => {
  queryClient.clear()
  return await firebase.auth().signOut()
}
