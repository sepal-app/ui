import React, { useEffect, useState, FormHTMLAttributes } from "react";
import { useParams } from "react-router-dom";
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow } from "@elastic/eui";
import { Form, Formik, FormikHelpers, FormikState } from "formik";

import Page from "./Page";
import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";
import { useCurrentOrganization } from "./lib/user";

interface TaxonFormProps {
  taxon: Taxon;
}

const TaxonForm: React.FC<TaxonFormProps> = () => {
  const { taxonId } = useParams();
  const [taxon, setTaxon] = useState({
    id: -1,
    name: "",
    rank: "",
    parent: { id: -1, name: "" }
  } as Taxon);
  const [org, ,] = useCurrentOrganization();

  useEffect(() => {
    if (!taxonId) {
      return;
    }

    taxonSvc
      .get(org.id, taxonId, { expand: ["parent"] })
      .then(t => setTaxon(t));
  }, [org.id, taxonId]);

  function handleSubmit(
    values: Taxon,
    { setSubmitting, resetForm }: FormikHelpers<Taxon>
  ) {
    const request =
      values.id > 0
        ? taxonSvc.update(org.id, values.id, values)
        : taxonSvc.create(org.id, values);

    request
      .then(savedTaxon => {
        setTaxon(savedTaxon);
        resetForm({ values: savedTaxon });
      })
      .catch(err => {
        // TODO: handle errors
        console.log(err);
      })
      .then(() => {
        setSubmitting(false);
      });
  }

  return (
    <Page contentTitle="Taxon form">
      <Formik
        enableReinitialize={true}
        initialValues={taxon}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Name">
                <EuiFieldText
                  name="name"
                  value={values.name || ""}
                  onChange={handleChange}
                />
              </EuiFormRow>
              <EuiFormRow label="Parent">
                <EuiFieldText
                  name="parent"
                  value={values.parent?.name || ""}
                  onChange={handleChange}
                />
              </EuiFormRow>
              <EuiFormRow label="Rank">
                <EuiFieldText
                  name="rank"
                  value={values.rank || ""}
                  onChange={handleChange}
                />
              </EuiFormRow>
              <EuiButton fill type="submit">
                Save
              </EuiButton>
            </EuiForm>
          </Form>
        )}
      </Formik>
    </Page>
  );
};

export default TaxonForm;
