import * as api from "./api"

function basePath([orgId, taxonId]: string[]) {
  return taxonId ? `/v1/orgs/${orgId}/taxa/${taxonId}` : `/v1/orgs/${orgId}/taxa`
}

export interface Taxon {
  id: string
  name: string
  rank: string
  parentId: string | null

  parent?: Taxon
}

export type TaxonFormValues = Pick<Taxon, "name" | "rank" | "parentId">

export const { create, get, list, update } = api.makeResource<Taxon, TaxonFormValues>(
  basePath,
)

export const meta = (ids: string[]) => {
  const path = [basePath(ids), "meta"].join("/").concat("/")
  return api.get(path)
}
