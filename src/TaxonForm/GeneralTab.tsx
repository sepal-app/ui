import React, { useEffect, useState } from "react";
import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiFormRow
} from "@elastic/eui";
import { Form, Formik, FormikHelpers } from "formik";

import * as taxonSvc from "../lib/taxon";
import { Taxon } from "../lib/taxon";
import { useCurrentOrganization } from "../lib/user";

interface TaxonFormProps {
  taxon: Taxon;
}

interface ParentCompletion {
  label: string;
  taxon: Taxon;
}

const TaxonForm: React.FC<TaxonFormProps> = ({ taxon }) => {
  const [org, ,] = useCurrentOrganization();
  const [parentCompletions, setParentCompletions] = useState<
    ParentCompletion[]
  >([]);
  const [selectedParents, setSelectedParents] = useState<
    ParentCompletion[] | undefined
  >([]);

  useEffect(() => {
    const parentCompletions = taxon.parent
      ? [{ label: taxon.parent.name, taxon: taxon.parent }]
      : [];
    setSelectedParents(parentCompletions);
    setParentCompletions(parentCompletions);
  }, [taxon.id]);

  async function handleSubmit(
    values: Taxon,
    { setSubmitting, resetForm }: FormikHelpers<Taxon>
  ) {
    const request =
      values.id > 0
        ? taxonSvc.update(org.id, values.id, values)
        : taxonSvc.create(org.id, values);

    try {
      const savedTaxon = await request;
      /* setTaxon(savedTaxon); */
      resetForm({ values: savedTaxon });
    } catch (err) {
      // TODO: handle errors
      console.error(err);
    }
    setSubmitting(false);
  }

  async function handleParentSearchChange(query: string) {
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
      setParentCompletions(items);
    } catch (err) {
      // TODO: handle error
      console.error(err);
    }
  }

  function handleParentChange(selectedOptions: any) {
    setSelectedParents(selectedOptions);
    let txn = JSON.parse(JSON.stringify(taxon)); // deep clone
    if (!!selectedOptions && selectedOptions.length) {
      txn.parentId = selectedOptions[0].taxon.id;
      txn.parent = selectedOptions[0].taxon;
    } else {
      txn.parentId = null;
      txn.parent = undefined;
    }
    /* setTaxon(txn); */
  }

  return (
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
              <EuiComboBox
                async
                placeholder="Search for a taxon"
                singleSelection={{ asPlainText: true }}
                options={parentCompletions}
                selectedOptions={selectedParents}
                onChange={handleParentChange}
                onSearchChange={handleParentSearchChange}
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
  );
};

export default TaxonForm;