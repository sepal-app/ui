import React, { useEffect, useState } from "react";
import {
  EuiAccordion,
  EuiListGroup,
  EuiListGroupItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText
} from "@elastic/eui";
import useSearchParams from "./hooks/search-params";

import Page from "./Page";
import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";
import TaxonSummaryBox from "./TaxonSummaryBox";

import * as accessionSvc from "./lib/accession";
import { Accession } from "./lib/accession";
import AccessionSummaryBox from "./AccessionSummaryBox";
import { useCurrentOrganization } from "./lib/user";

const Search: React.FC = () => {
  const [taxa, setTaxa] = useState<Taxon[]>([]);
  const [accessions, setAccessions] = useState<Accession[]>([]);
  const [selected, setSelected] = useState();
  const [selectedType, setSelectedType] = useState();
  const [org, ,] = useCurrentOrganization();
  const params = useSearchParams();
  const query = params.get("q");

  useEffect(() => {
    if (!query) {
      return;
    }
    taxonSvc.search(org.id, query).then(results => setTaxa(results));
    accessionSvc.search(org.id, query).then(results => setAccessions(results));
  }, [org.id, query]);

  function renderSearchResults() {
    function handleClick(item: Taxon | Accession, type: string) {
      setSelected(item);
      setSelectedType(type);
    }
    const accessionItems = accessions.map(accession => {
      return (
        <EuiListGroupItem
          label={
            <EuiText>
              <h5>{accession.code}</h5>
            </EuiText>
          }
          key={accession.id}
          onClick={() => handleClick(accession, "accession")}
          isActive={selected === accession}
        />
      );
    });

    const taxonItems = taxa.map(taxon => {
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
          key={taxon.id}
          onClick={() => handleClick(taxon, "taxon")}
          isActive={selected === taxon}
        />
      );
    });

    return (
      <>
        <EuiAccordion
          buttonContent="Accessions"
          id="accessionsAccordion"
          initialIsOpen={true}
        >
          <EuiListGroup>{accessionItems}</EuiListGroup>
        </EuiAccordion>
        <EuiAccordion
          buttonContent="Taxa"
          id="taxaAccordion"
          initialIsOpen={true}
        >
          <EuiListGroup>{taxonItems}</EuiListGroup>
        </EuiAccordion>
      </>
    );
  }

  function renderSelected() {
    switch (selectedType) {
      case "taxon":
        return <TaxonSummaryBox item={selected} />;
      case "accession":
        return <AccessionSummaryBox item={selected} />;
      default:
        return <></>;
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
