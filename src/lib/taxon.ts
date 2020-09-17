import { Observable } from "rxjs"
import { map } from "rxjs/operators"

import * as api from "./api"

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/taxa`
}

export interface Taxon {
  id: number
  name: string
  rank: string
  parentId: number | null

  parent?: Taxon
}

export type TaxonFormValues = Pick<Taxon, "name" | "rank" | "parentId">

interface TaxonSearchResult {
  results: Taxon[]
}

export const { get, create, update } = api.makeResource<Taxon, TaxonFormValues>(basePath)

export const meta = (orgId: number) => {
  const path = [basePath(orgId), "meta"].join("/").concat("/")
  return api.get(path)
}

export const search = (
  orgId: string | number,
  query: string,
  // options?: { expand?: string[]; include?: string[] }
): Observable<Taxon[]> => {
  console.log(`Taxon.search: ${query}`)
  const params = new URLSearchParams({ search: query })
  const queryParams = "?".concat(params.toString())
  const path = [basePath(orgId), queryParams].join("/")
  return api.get<TaxonSearchResult>(path).pipe(map((resp) => resp.results))
}
