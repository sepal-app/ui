import React, { useState } from "react"
import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui"

import Page from "../Page"
import { Location } from "../lib/location"
import { LocationSummaryBox } from "../LocationSummaryBox"
import { Taxon } from "../lib/taxon"
import { TaxonSummaryBox } from "../TaxonSummaryBox"
import { Accession } from "../lib/accession"
import { AccessionSummaryBox } from "../AccessionSummaryBox"
import { ResultsList } from "./ResultsList"
import { SearchResultItem } from "./types"

export const Search: React.FC = () => {
  const [selected, setSelected] = useState<SearchResultItem | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  function renderSelected() {
    switch (selectedType) {
      case "taxon":
        return <TaxonSummaryBox item={selected as Taxon} />
      case "accession":
        return <AccessionSummaryBox item={selected as Accession} />
      case "location":
        return <LocationSummaryBox item={selected as Location} />
      default:
        return <></>
    }
  }

  return (
    <Page contentTitle="Search">
      <EuiFlexGroup>
        <EuiFlexItem>
          <ResultsList
            onSelected={(item, itemType) => {
              console.log("-----")
              console.log(item)
              setSelected(item)
              setSelectedType(itemType)
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem>{renderSelected()}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  )
}
