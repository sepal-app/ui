import { useState } from "react"

export const useExpiringState = <T>(
  startValue: T,
  expirationTime: number,
): [T, (newValue: T) => void] => {
  const [value, setValue] = useState(startValue)

  const expiringSetValue = (newValue: T) => {
    setValue(newValue)
    setTimeout(() => setValue(startValue), expirationTime)
  }

  return [value, expiringSetValue]
}
