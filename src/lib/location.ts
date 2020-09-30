import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import * as api from "./api"

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/locations`
}

export interface Location {
  id: number
  code: string
  name: string
  description: string
}

export type LocationFormValues = Pick<Location, "code" | "name" | "description">

interface LocationSearchResult {
  results: Location[]
}

export const { get, create, update } = api.makeResource<Location, LocationFormValues>(
  basePath,
)

// export const meta = (orgId: number) => {
//   const path = [basePath(orgId), "meta"].join("/").concat("/")
//   return api.get(path)
// }

export const search = (
  orgId: string | number,
  query: string,
  // options?: { expand?: string[]; include?: string[] }
): Observable<Location[]> => {
  const params = new URLSearchParams({ q: query })
  const queryParams = "?".concat(params.toString())
  const path = [basePath(orgId), queryParams].join("")
  return api.get<LocationSearchResult>(path).pipe(map((resp) => resp.results))
  // .then((resp: LocationSearchResult) => resp.results);
}
