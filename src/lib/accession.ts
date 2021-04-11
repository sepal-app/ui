import * as api from "./api"
import { Taxon } from "./taxon"

function basePath([orgId, accessionId]: string[]) {
  return accessionId
    ? `/v1/orgs/${orgId}/accessions/${accessionId}`
    : `/v1/orgs/${orgId}/accessions`
}

function itemsBasePath([orgId, accessionId, accessionItemId]: string[]) {
  return accessionItemId
    ? `/v1/orgs/${orgId}/accessions/${accessionId}/items/${accessionItemId}`
    : `/v1/orgs/${orgId}/accessions/${accessionId}/items`
}

export interface Accession {
  id: string
  code: string
  taxonId: string

  taxon?: Taxon
}

export interface AccessionItem {
  id: string
  code: string
  accessionId: string

  accession?: Accession
}

export type AccessionFormValues = Pick<Accession, "code" | "taxonId">
export type AccessionItemFormValues = Pick<AccessionItem, "code" | "accessionId">

export const { create, get, list, update } = api.makeResource<
  Accession,
  AccessionFormValues
>(basePath)

export const meta = (orgId: string) => {
  const path = [basePath([orgId]), "meta"].join("/").concat("/")
  return api.get(path)
}

export const {
  create: createItem,
  get: getItem,
  list: listItems,
  update: updateItem,
} = api.makeResource<AccessionItem, AccessionFormValues>(itemsBasePath)
