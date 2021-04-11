import React, { useState } from "react"
import { useQuery } from "react-query"
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui"
import { useHistory } from "react-router-dom"

import { Taxon, get as getTaxon } from "./lib/taxon"
import { useCurrentOrganization } from "./lib/organization"

interface Props {
  item: Taxon
}

export const TaxonSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const [org] = useCurrentOrganization()
  const [taxon, setTaxon] = useState(item)

  useQuery(
    ["taxon", org.id, item.id, { include: ["parent"] }],
    () => getTaxon([org.id, item.id]),
    {
      enabled: !!item,
      onSuccess: (data) => {
        console.log(data)
        setTaxon(data)
      },
    },
  )
  return (
    <>
      <EuiText>
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <h3>{taxon?.name}</h3>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty size="xs" onClick={() => history.push(`/taxon/${taxon?.id}`)}>
              Edit
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <dl>
              <dt>Parent Taxon</dt>
              <dd>{taxon?.parent && taxon.parent.name}</dd>
            </dl>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiText>
    </>
  )
}
