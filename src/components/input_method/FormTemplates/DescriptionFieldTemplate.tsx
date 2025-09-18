import React from 'react'
import { TextUtil } from '@botsquad/sdk'
import { getUiOptions } from '@rjsf/utils'
import { DescriptionFieldProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils'

export default function DescriptionFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: DescriptionFieldProps<T, S, F>) {
  const { id, description, registry, uiSchema } = props;
  const opts = getUiOptions<T, S, F>(uiSchema, registry.globalUiOptions)

  if (!description) {
    return null;
  }

  const child =
    opts.enableMarkdownInDescription && typeof description === 'string'
      ? <div dangerouslySetInnerHTML={TextUtil.processText(description)} />
      : description

  return (
    <div id={id} className='field-description'>
      {child}
    </div>
  )
}
