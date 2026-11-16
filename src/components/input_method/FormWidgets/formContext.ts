import { Registry } from '@rjsf/utils'

/** The `formContext` that `Form.tsx` passes to rjsf. */
export interface FormContext {
  localePrefs: string[]
  setWidgetError: (id: string, error: boolean) => void
}

/**
 * Widgets get the form context from `registry.formContext`: rjsf v6 removed the
 * `formContext` prop from `WidgetProps`.
 */
export function getFormContext(registry: Registry): FormContext {
  return registry.formContext as FormContext
}
