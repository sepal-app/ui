import React, { useState } from "react"
import { useQuery } from "react-query"
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui"
import { useHistory } from "react-router-dom"

import { Accession, get as getAccession } from "./lib/accession"
import { useCurrentOrganization } from "./lib/organization"

interface Props {
  item: Accession
}

export const AccessionSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const [org] = useCurrentOrganization()
  const [accession, setAccession] = useState(item)
  useQuery(
    ["accession", org.id, item.id, { include: "taxon" }],
    () => getAccession(org.id, item.id),
    {
      enabled: !!item,
      onSuccess: (data) => {
        setAccession(data)
      },
    },
  )

  return (
    <>
      <EuiText>
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <h3>{accession?.code}</h3>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="xs"
              onClick={() => history.push(`/accession/${accession?.id}`)}
            >
              Edit
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <dl>
              <dt>Taxon</dt>
              <dd>{accession?.taxon && accession.taxon.name}</dd>
            </dl>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiText>
    </>
  )
}
