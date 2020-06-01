import React from "react"
import { EuiLink, EuiText } from "@elastic/eui"
import { pluckFirst, useObservable, useObservableState } from "observable-hooks"
import { combineLatest } from "rxjs"
import { switchMap } from "rxjs/operators"

import * as accessionSvc from "./lib/accession"
import { Accession } from "./lib/accession"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"

interface Props {
  item: Accession
}

export const AccessionSummaryBox: React.FC<Props> = ({ item }) => {
  const item$ = useObservable(pluckFirst, [item])
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const accession = useObservableState(
    combineLatest(item$, org$).pipe(
      switchMap(([{ id }, org]) =>
        accessionSvc.get(org.id, id, {
          expand: ["taxon"],
        }),
      ),
    ),
    item,
  )

  return (
    <>
      <EuiLink href={`/accession/${accession?.id}`}>Edit</EuiLink>
      <EuiText>
        <h3>{accession?.code}</h3>
        <p>{accession?.taxon?.name && accession.taxon.name}</p>
      </EuiText>
    </>
  )
}
