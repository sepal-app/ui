import React, { useEffect, useState } from "react";
import { EuiLink, EuiText } from "@elastic/eui";

import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";
import { useCurrentOrganization } from "./lib/user";

interface TaxonSummaryBoxProps {
  item: Taxon;
}

const TaxonSummaryBox: React.FC<TaxonSummaryBoxProps> = ({ item }) => {
  const [org, ,] = useCurrentOrganization();
  const [taxon, setTaxon] = useState(item);

  useEffect(() => {
    taxonSvc
      .get(org.id, taxon.id, { expand: ["parent"] })
      .then(t => setTaxon(t));
  }, [org.id, taxon.id]);

  return (
    <>
      <EuiLink href={`/taxon/${taxon.id}`}>Edit</EuiLink>
      <EuiText>
        <h3>{taxon.name}</h3>
        <p>{taxon.parent && taxon.parent.name}</p>
      </EuiText>
    </>
  );
};

export default TaxonSummaryBox;
