import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EuiTabbedContent } from "@elastic/eui";

import Page from "../Page";
import * as taxonSvc from "../lib/taxon";
import { Taxon } from "../lib/taxon";
import { useCurrentOrganization } from "../lib/user";

import GeneralTab from "./GeneralTab";

const TaxonForm: React.FC = () => {
  const { taxonId } = useParams();
  const [taxon, setTaxon] = useState({
    id: -1,
    name: "",
    rank: "",
    parent: { id: -1, name: "" }
  } as Taxon);
  const [org, ,] = useCurrentOrganization();

  useEffect(() => {
    async function fetchTaxon() {
      if (!taxonId) {
        return;
      }

      try {
        const txn = await taxonSvc.get(org.id, parseInt(taxonId), {
          expand: ["parent"]
        });
        setTaxon(txn);
      } catch (err) {
        console.error(err);
        // TODO: handle errors
      }
    }

    fetchTaxon();
  }, [org.id, taxonId]);

  const tabs = [
    { id: "general", name: "General", content: <GeneralTab taxon={taxon} /> },
    { id: "other", name: "Other", content: <></> }
  ];

  return (
    <Page contentTitle="Taxon form">
      <EuiTabbedContent tabs={tabs} />
    </Page>
  );
};

export default TaxonForm;
