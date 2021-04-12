import React, { useState } from "react"
import { useInfiniteQuery } from "react-query"
import {
  EuiAccordion,
  EuiLink,
  EuiListGroup,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui"

import { Location, list as listLocations } from "../lib/location"
import { ListItem } from "./ListItem"

const pageSize = 4

export const useLocationsSearchProvider = (orgId: string | null, q: string | null) => {
  const { hasNextPage, data, fetchNextPage } = useInfiniteQuery(
    ["locations", orgId, { limit: pageSize, query: q }],
    async ({ pageParam: cursor }) => {
      const opts = cursor ? { cursor } : undefined
      return await listLocations([orgId ?? ""], opts)
    },
    {
      enabled: !!(orgId && q),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const renderItem = (
    location: Location,
    isActive: boolean,
    onClick: (location: Location) => void,
  ) => (
    <ListItem
      title={location.name}
      subtitle={location.code}
      key={location.id}
      onClick={() => onClick(location)}
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
