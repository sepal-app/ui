import React from "react";
import { Taxon } from "./lib/taxon";

interface TaxonSummaryBoxProps {
  taxon: Taxon;
}

const TaxonSummaryBox: React.FC<TaxonSummaryBoxProps> = ({ taxon }) => {
  return <>{taxon.name}</>;
};

export default TaxonSummaryBox;
