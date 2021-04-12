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

export type ItemType = "plant" | "seed" | "vegetative" | "tissue" | "other"

export interface AccessionItem {
  id: string
  code: string
  itemType: ItemType
  accessionId: string
  locationId: string

  accession?: Accession
}

export type AccessionFormValues = Pick<Accession, "code" | "taxonId">
export type AccessionItemFormValues = Pick<
  AccessionItem,
  "accessionId" | "code" | "itemType" | "locationId"
>

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
  list: listItems,
  update: updateItem,
} = api.makeResource<AccessionItem, AccessionItemFormValues>(itemsBasePath)
