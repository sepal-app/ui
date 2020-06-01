import React from "react"
import { EuiLink, EuiText } from "@elastic/eui"
import { pluckFirst, useObservable, useObservableState } from "observable-hooks"
import { combineLatest } from "rxjs"
import { switchMap } from "rxjs/operators"

import * as taxonSvc from "./lib/taxon"
import { Taxon } from "./lib/taxon"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"

interface Props {
  item: Taxon
}

export const TaxonSummaryBox: React.FC<Props> = ({ item }) => {
  const item$ = useObservable(pluckFirst, [item])
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const taxon = useObservableState(
    combineLatest(item$, org$).pipe(
      switchMap(([{ id }, org]) =>
        taxonSvc.get(org.id, id, {
          expand: ["parent"],
        }),
      ),
    ),
    item,
  )

  return (
    <>
      <EuiLink href={`/taxon/${taxon.id}`}>Edit</EuiLink>
      <EuiText>
        <h3>{taxon.name}</h3>
        <p>{taxon.parent && taxon.parent.name}</p>
      </EuiText>
    </>
  )
}
