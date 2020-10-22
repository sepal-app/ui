import * as Yup from "yup"

export const GeneralTabSchema = Yup.object().shape({
  name: Yup.string().required(),
  rank: Yup.string().required(),
  parent_id: Yup.number(),
})
