import React, { useState } from "react"
import { useQuery } from "react-query"
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui"
import { useHistory } from "react-router-dom"

import { Location, get as getLocation } from "./lib/location"
import { useCurrentOrganization } from "./lib/organization"

interface Props {
  item: Location
}

export const LocationSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const [org] = useCurrentOrganization()
  const [location, setLocation] = useState(item)
  useQuery(
    ["location", org.id, item.id, { include: "taxon" }],
    () => getLocation([org.id, item.id]),
    {
      enabled: !!item,
      onSuccess: (data) => {
        setLocation(data)
      },
    },
  )

  return (
    <>
      <EuiText>
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <h3>{location?.code}</h3>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="xs"
              onClick={() => history.push(`/location/${location?.id}`)}
            >
              Edit
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiText>
    </>
  )
}
