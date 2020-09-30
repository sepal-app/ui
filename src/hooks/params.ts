import { useLocation, useParams } from "react-router-dom"
import { pluckFirst, useObservable, useObservableState } from "observable-hooks"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

export function useSearchParams(): URLSearchParams {
  const location = useLocation()
  return new URLSearchParams(location.search)
}

export const useParamsObservable = <T>() => useObservable(pluckFirst, [useParams<T>()])

export const useParamsValueObservable = (key: string): Observable<string | null> =>
  useObservable((value$) => value$.pipe(map(([v]) => v)), [useSearchParams().get(key)])

export const useParamsValueObservableState = (key: string, initialState?: any): string =>
  useObservableState(useParamsValueObservable(key), initialState)
