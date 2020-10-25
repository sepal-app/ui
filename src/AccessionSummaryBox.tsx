import React, { useEffect, useState } from "react"
import { EuiLink, EuiText } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { combineLatest } from "rxjs"
import { switchMap, tap } from "rxjs/operators"
import { useHistory } from "react-router-dom"

import * as AccessionService from "./lib/accession"
import { Accession } from "./lib/accession"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"

interface Props {
  item: Accession
}

export const AccessionSummaryBox: React.FC<Props> = ({ item }) => {
  const history = useHistory()
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const [accession, setAccession] = useState(item)

  useEffect(() => {
    if (!item || !org) {
      return
    }

    // get full accession details
    AccessionService.get(org.id, item.id).toPromise().then(setAccession)
  }, [item, org])

  return (
    <>
      <EuiLink onClick={() => history.push(`/accession/${accession.id}`)}>Edit</EuiLink>
      <EuiText>
        <h3>{accession?.code}</h3>
        <p>{accession?.taxon?.name && accession.taxon.name}</p>
      </EuiText>
    </>
  )
}
