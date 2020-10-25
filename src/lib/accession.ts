import * as api from "./api"
import { Taxon } from "./taxon"

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/accessions`
}

export interface Accession {
  id: number
  code: string
  taxonId: number

  taxon?: Taxon
}

export type AccessionFormValues = Pick<Accession, "code" | "taxonId">

export const { create, get, list, update } = api.makeResource<
  Accession,
  AccessionFormValues
>(basePath)

export const meta = (orgId: number) => {
  const path = [basePath(orgId), "meta"].join("/").concat("/")
  return api.get(path)
}
