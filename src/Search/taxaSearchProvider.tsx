import React, { useState } from "react"
import { useInfiniteQuery } from "react-query"
import {
  EuiAccordion,
  EuiLink,
  EuiListGroup,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui"

import { Taxon, list as listTaxa } from "../lib/taxon"
import { ListItem } from "./ListItem"

const pageSize = 4

export const useTaxaSearchProvider = (orgId: string | null, q: string | null) => {
  const { hasNextPage, data, fetchNextPage } = useInfiniteQuery(
    ["taxa", orgId, { limit: pageSize, query: q }],
    async ({ pageParam: cursor }) => {
      const opts = cursor ? { cursor } : undefined
      return await listTaxa([orgId ?? ""], opts)
    },
    {
      enabled: !!(orgId && q),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const renderItem = (
    taxon: Taxon,
    isActive: boolean,
    onClick: (taxon: Taxon) => void,
  ) => (
    <ListItem
      title={taxon.name}
      subtitle={taxon.rank}
      key={taxon.id}
      onClick={() => onClick(taxon)}
      isActive={isActive}
    />
  )

  return {
    hasNextPage,
    pages: data?.pages ?? [],
    fetchNextPage,
    renderItem,
  }
}
