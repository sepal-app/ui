import { useState } from "react"

function useLocalStorage(key: string): [string | undefined, (value: string) => void] {
  // use state so that components get updated
  const [, setState] = useState()
  const setter = function (value: string) {
    localStorage.setItem(key, value)
    setState(value)
  }
  const value = localStorage.getItem(key)
  return [value || undefined, setter]
}

export default useLocalStorage
