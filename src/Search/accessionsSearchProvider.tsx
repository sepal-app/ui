import React, { useState } from "react"
import { useInfiniteQuery } from "react-query"
import {
  EuiAccordion,
  EuiLink,
  EuiListGroup,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui"

import { Accession, list as listAccessions } from "../lib/accession"
import { ListItem } from "./ListItem"

const pageSize = 4

export const useAccessionsSearchProvider = (orgId: string | null, q: string | null) => {
  const { hasNextPage, data, fetchNextPage } = useInfiniteQuery(
    ["accessions", orgId, { limit: pageSize, query: q, include: ["taxon"] }],
    ({ pageParam: cursor }) =>
      listAccessions([orgId ?? ""], {
        cursor,
        include: ["taxon"],
        limit: pageSize,
        query: q,
      }),
    {
      enabled: !!(orgId && q),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const renderItem = (
    accession: Accession,
    isActive: boolean,
    onClick: (accession: Accession) => void,
  ) => (
    <ListItem
      title={accession.code}
      subtitle={accession.taxon?.name ?? ""}
      key={accession.id}
      onClick={() => onClick(accession)}
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
