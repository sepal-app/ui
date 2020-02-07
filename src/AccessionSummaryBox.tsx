import React, { useEffect, useState } from "react";

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

  return <>{accession.code}</>;
};

export default AccessionSummaryBox;
