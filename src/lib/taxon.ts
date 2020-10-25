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

export const { create, get, list, update } = api.makeResource<Taxon, TaxonFormValues>(
  basePath,
)

export const meta = (orgId: number) => {
  const path = [basePath(orgId), "meta"].join("/").concat("/")
  return api.get(path)
}
