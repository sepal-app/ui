import { useState } from "react"

export const useExpiringState = <T>(
  startValue: T,
  expirationTime: number,
): [T, (newValue: T) => void] => {
  const [value, setValue] = useState()
  console.log("use state")

  const expiringSetValue = (newValue: T) => {
    console.log("expiring set")
    setValue(newValue)
    setTimeout(() => setValue(startValue), expirationTime)
  }

  return [value, expiringSetValue]
}
