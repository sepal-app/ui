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
import * as taxonSvc from "./lib/taxon";
import { Taxon } from "./lib/taxon";
import { useCurrentOrganization } from "./lib/user";

interface TaxonFormProps {
  taxon: Taxon;
}

interface ParentCompletion {
  label: string;
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
  const [parentCompletions, setParentCompletions] = useState<
    ParentCompletion[]
  >([]);
  const [selectedParents, setSelectedParents] = useState<
    ParentCompletion[] | undefined
  >([]);

  useEffect(() => {
    if (!taxonId) {
      return;
    }

    taxonSvc.get(org.id, parseInt(taxonId), { expand: ["parent"] }).then(t => {
      setTaxon(t);
      const parentCompletions = t.parent
        ? [{ label: t.parent.name, taxon: t.parent }]
        : [];
      setSelectedParents(parentCompletions);
      setParentCompletions(parentCompletions);
    });
  }, [org.id, taxonId]);

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
      setTaxon(savedTaxon);
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
    if (!!selectedOptions && selectedOptions.length) {
      taxon.parentId = selectedOptions[0].taxon.id;
      taxon.parent = selectedOptions[0].taxon;
    } else {
      taxon.parentId = null;
      taxon.parent = undefined;
    }
    setTaxon(taxon);
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
    </Page>
  );
};

export default TaxonForm;
