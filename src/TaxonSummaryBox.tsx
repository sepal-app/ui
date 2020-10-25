import React, { useEffect, useState } from "react"
import { EuiLink, EuiText } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { useHistory } from "react-router-dom"

import * as TaxonService from "./lib/taxon"
import { Taxon } from "./lib/taxon"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"

interface Props {
  item: Taxon
}

export const TaxonSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const [taxon, setTaxon] = useState(item)

  useEffect(() => {
    if (!item || !org) {
      return
    }

    // get full taxon details
    TaxonService.get(org.id, item.id).toPromise().then(setTaxon)
  }, [item, org])

  return (
    <>
      <EuiLink onClick={() => history.push(`/taxon/${taxon.id}`)}>Edit</EuiLink>
      <EuiText>
        <h3>{taxon.name}</h3>
        <p>{taxon.parent && taxon.parent.name}</p>
      </EuiText>
    </>
  )
}
