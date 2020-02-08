import React, { useEffect, useState, FormHTMLAttributes } from "react";
import { useParams } from "react-router-dom";
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow } from "@elastic/eui";
import { Form, Formik, FormikHelpers, FormikState } from "formik";

import Page from "./Page";
import * as accessionSvc from "./lib/accession";
import { Accession } from "./lib/accession";
import { useCurrentOrganization } from "./lib/user";

interface AccessionFormProps {
  accession: Accession;
}

const AccessionForm: React.FC<AccessionFormProps> = () => {
  const { accessionId } = useParams();
  const [accession, setAccession] = useState({
    id: -1,
    code: "",
    taxonId: -1
    /* rank: "", */
    /* parent: { id: -1, name: "" } */
  } as Accession);
  const [org, ,] = useCurrentOrganization();

  useEffect(() => {
    if (!accessionId) {
      return;
    }

    accessionSvc
      .get(org.id, parseInt(accessionId), { expand: ["taxon"] })
      .then(t => setAccession(t));
  }, [org.id, accessionId]);

  function handleSubmit(
    values: Accession,
    { setSubmitting, resetForm }: FormikHelpers<Accession>
  ) {
    const request =
      values.id > 0
        ? accessionSvc.update(org.id, values.id, values)
        : accessionSvc.create(org.id, values);

    request
      .then(savedAccession => {
        setAccession(savedAccession);
        resetForm({ values: savedAccession });
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
    <Page contentTitle="Accession form">
      <Formik
        enableReinitialize={true}
        initialValues={accession}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Code">
                <EuiFieldText
                  name="code"
                  value={values.code || ""}
                  onChange={handleChange}
                />
              </EuiFormRow>
              <EuiFormRow label="Taxon">
                <EuiFieldText
                  name="taxon"
                  value={values.taxon?.name || ""}
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

export default AccessionForm;
