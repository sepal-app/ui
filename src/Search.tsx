import React, { useEffect, useState } from "react";
import {
  EuiListGroup,
  EuiListGroupItem,
  EuiSpacer,
  EuiSwitch,
  EuiCode,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText
} from "@elastic/eui";

import Page from "./Page";
import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";
import TaxonSummaryBox from "./TaxonSummaryBox";
import { useCurrentOrganization } from "./lib/user";

const Search: React.FC = () => {
  const [taxonResults, setTaxonResults] = useState<Taxon[]>([]);
  const [selected, setSelected] = useState();
  const [selectedType, setSelectedType] = useState();
  const [org, ,] = useCurrentOrganization();

  useEffect(() => {
    taxonSvc.search(org.id, "max").then(results => setTaxonResults(results));
  }, []);

  function renderSearchResults() {
    function handleClick(taxon: Taxon) {
      setSelected(taxon);
      setSelectedType("taxon");
    }

    const items = taxonResults.map(taxon => {
      return (
        <EuiListGroupItem
          label={
            <EuiText>
              <h5>{taxon.name}</h5>
              <p>
                <small>{taxon.rank}</small>
              </p>
            </EuiText>
          }
          onClick={() => handleClick(taxon)}
          isActive={selected === taxon}
        />
      );
    });
    return <EuiListGroup>{items}</EuiListGroup>;
  }

  function renderSelected() {
    switch (selectedType) {
      case "taxon":
        return <TaxonSummaryBox taxon={selected} />;
    }
  }
  return (
    <Page contentTitle="Search">
      <EuiFlexGroup>
        <EuiFlexItem>{renderSearchResults()}</EuiFlexItem>
        <EuiFlexItem>{renderSelected()}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  );
};

export default Search;
