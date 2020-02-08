import React, { useEffect, useState } from "react";
import { EuiLink, EuiText } from "@elastic/eui";

import * as accessionSvc from "./lib/accession";
import { Accession } from "./lib/accession";
import { useCurrentOrganization } from "./lib/user";

interface AccessionSummaryBoxProps {
  item: Accession;
}

const AccessionSummaryBox: React.FC<AccessionSummaryBoxProps> = ({ item }) => {
  const [org, ,] = useCurrentOrganization();
  const [accession, setAccession] = useState(item);

  useEffect(() => {
    accessionSvc
      .get(org.id, accession.id, { expand: ["taxon"] })
      .then(acc => setAccession(acc));
  }, [org.id, accession.id]);

  return (
    <>
      <EuiLink href={`/accession/${accession.id}`}>Edit</EuiLink>
      <EuiText>
        <h3>{accession.code}</h3>
        <p>{accession?.taxon?.name && accession.taxon.name}</p>
      </EuiText>
    </>
  );
};

export default AccessionSummaryBox;
