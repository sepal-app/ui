import omit from "lodash/omit"
import React, { useEffect, useState } from "react"
import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiTextColor,
} from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import _ from "lodash"

import { Taxon, TaxonFormValues } from "../lib/taxon"
import { useExpiringState } from "../hooks"
import { GeneralTabSchema } from "./formSchemas"
import { Rank, RankOption } from "./types"
import { TaxonField } from "../TaxonField"

interface Props {
  taxon: Taxon
  onSubmit: (values: TaxonFormValues) => Promise<Taxon>
}

const rankOptions: RankOption[] = [
  {
    label: "Family",
    value: "family",
  },
  {
    label: "Genus",
    value: "genus",
  },
  {
    label: "Species",
    value: "species",
  },
]

export const GeneralTab: React.FC<Props> = ({ taxon, onSubmit }) => {
  const [success, setSuccess] = useExpiringState(false, 1000)
  const [selectedRankOption, setSelectedRankOption] = useState<RankOption | null>(
    () => rankOptions.find((o) => o.value === taxon?.rank) ?? null,
  )

  useEffect(() => {
    if (!taxon) {
      return
    }
    const rankOption = rankOptions.find((o) => o.value === taxon.rank) ?? null
    setSelectedRankOption(rankOption)
  }, [taxon])

  const handleSubmit = async (
    values: TaxonFormValues,
    { setSubmitting }: FormikHelpers<TaxonFormValues>,
  ): Promise<void> => {
    try {
      await onSubmit(values)
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik<TaxonFormValues>
      enableReinitialize={true}
      initialValues={omit(taxon, ["id"]) as Taxon}
      onSubmit={handleSubmit}
      validationSchema={GeneralTabSchema}
    >
      {({ handleChange, dirty, isSubmitting, isValid, values }) => (
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
              <TaxonField
                value={values.parentId}
                onChange={(taxon) => {
                  console.log("onChange()")
                  console.log(taxon)
                  handleChange("parentId")(taxon?.id.toString() ?? "")
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="Rank">
              <EuiComboBox<Rank>
                placeholder="Select a taxonomic rank"
                singleSelection={{ asPlainText: true }}
                options={rankOptions}
                selectedOptions={selectedRankOption ? [selectedRankOption] : []}
                onChange={(options) => {
                  const option = options?.[0]
                  handleChange("rank")(option ? (option.value as string) : "")
                  setSelectedRankOption(option as RankOption)
                }}
              />
            </EuiFormRow>
            <div style={{ marginTop: "20px" }}>
              <EuiButton
                fill
                isDisabled={!dirty || !isValid || isSubmitting}
                isLoading={isSubmitting}
                type="submit"
              >
                Save
              </EuiButton>
              {success && (
                <EuiTextColor color="secondary" style={{ marginLeft: "20px" }}>
                  Success!
                </EuiTextColor>
              )}
            </div>
          </EuiForm>
        </Form>
      )}
    </Formik>
  )
}
