import { FieldErrors } from "react-hook-form"

export const emailRx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const useFieldErrorMessages = (
  messages: Record<string, Record<string, string>>,
  errors: FieldErrors,
): ((field: string) => string[] | null) => (field: string): string[] | null => {
  const fieldErrors = errors[field]
  if (!fieldErrors) {
    return []
  }

  const fieldMessages = messages[field] ?? {}

  if (Array.isArray(fieldErrors.types)) {
    return fieldErrors.types
      .map((errorType: string) => fieldMessages?.[errorType] ?? fieldMessages?.default)
      .filter((m: string) => !!m)
  } else if (fieldMessages[fieldErrors.type]) {
    return [fieldMessages[fieldErrors.type]]
  } else if (fieldMessages.default) {
    return [fieldMessages.default]
  } else return null
}
