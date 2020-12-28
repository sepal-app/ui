import React, { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { useHistory } from "react-router-dom"

import { Taxon, get as getTaxon } from "./lib/taxon"
import { currentOrganization$ } from "./lib/organization"
import { isNotEmpty } from "./lib/observables"

interface Props {
  item: Taxon
}

export const TaxonSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const [taxon, setTaxon] = useState(item)

  useQuery(
    ["taxon", org.id, item.id, { include: ["parent"] }],
    () => getTaxon(org.id, item.id),
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
