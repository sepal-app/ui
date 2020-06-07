import { useLocation, useParams } from "react-router-dom"
import { pluckFirst, useObservable } from "observable-hooks"

export function useSearchParams() {
  const location = useLocation()
  return new URLSearchParams(location.search)
}

export const useParamsObservable = <T>() => useObservable(pluckFirst, [useParams<T>()])
