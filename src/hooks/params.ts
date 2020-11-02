import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

export function useSearchParams(): URLSearchParams {
  // TODO: we can probably rmeove the useSearchParams hooks when
  // react-router-dom v6 is released which contains its own search params hook
  const location = useLocation()
  const [searchParams, setSearchParams] = useState(new URLSearchParams(location.search))
  useEffect(() => {
    setSearchParams(new URLSearchParams(location.search))
  }, [location])

  return searchParams
}
