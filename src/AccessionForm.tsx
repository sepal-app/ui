import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiFormRow
} from "@elastic/eui";
import { Form, Formik, FormikHelpers } from "formik";

import Page from "./Page";
import * as accessionSvc from "./lib/accession";
import { Accession, AccessionFormValues } from "./lib/accession";
import { useCurrentOrganization } from "./lib/user";
import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";

interface AccessionFormProps {
  accession: Accession;
}

interface TaxonCompletion {
  label: string;
  taxon: Taxon;
}

const AccessionForm: React.FC<AccessionFormProps> = () => {
  const { accessionId } = useParams();
  const [formValues, setFormValues] = useState<AccessionFormValues>({
    code: "",
    taxonId: -1
  });
  const [org, ,] = useCurrentOrganization();
  const [taxonCompletions, setTaxonCompletions] = useState<TaxonCompletion[]>(
    []
  );
  const [selectedTaxa, setSelectedTaxa] = useState<
    TaxonCompletion[] | undefined
  >([]);

  useEffect(() => {
    async function fetchAccession() {
      if (!accessionId) {
        return;
      }
      try {
        const acc = await accessionSvc.get(org.id, parseInt(accessionId), {
          expand: ["taxon"]
        });

        // TODO: if we can't find an accession with this id we should redirect
        // to a 404
        setFormValues({
          code: acc.code,
          taxonId: acc.taxonId
        });

        const taxonCompletions = acc.taxon
          ? [{ label: acc.taxon.name, taxon: acc.taxon }]
          : [];
        setSelectedTaxa(taxonCompletions);
        setTaxonCompletions(taxonCompletions);
      } catch (err) {
        // TODO: handler errors
        console.error(err);
      }
    }

    fetchAccession();
  }, [org.id, accessionId]);

  async function handleSubmit(
    values: AccessionFormValues,
    { setSubmitting }: FormikHelpers<AccessionFormValues>
  ) {
    values.taxonId = (selectedTaxa as TaxonCompletion[])[0].taxon.id as number;
    try {
      await (!!accessionId
        ? accessionSvc.update(
            org.id,
            parseInt(accessionId),
            values as AccessionFormValues
          )
        : accessionSvc.create(org.id, values as AccessionFormValues));
    } catch (err) {
      // TODO: handle errors
      console.error(err);
    }
    setSubmitting(false);
  }

  async function handleTaxonSearchChange(query: string) {
    if (query.length < 3) {
      return;
    }
    try {
      const taxa = await taxonSvc.search(org.id, query);
      const items = taxa.map(taxon => {
        return {
          label: taxon.name,
          taxon: taxon
        };
      });
      setTaxonCompletions(items);
    } catch (err) {
      // TODO: handle error
      console.error(err);
    }
  }

  function handleTaxonChange(selectedOptions: any) {
    setSelectedTaxa(selectedOptions);
  }

  return (
    <Page contentTitle="Accession form">
      <Formik
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={formValues}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Code">
                <EuiFieldText
                  name="code"
                  onChange={handleChange}
                  value={values.code || ""}
                />
              </EuiFormRow>
              <EuiFormRow label="Taxon">
                <EuiComboBox
                  async
                  placeholder="Search for a taxon"
                  singleSelection={{ asPlainText: true }}
                  options={taxonCompletions}
                  selectedOptions={selectedTaxa}
                  onChange={handleTaxonChange}
                  onSearchChange={handleTaxonSearchChange}
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
