import React from 'react'
import type { Contact as ContactType } from 'action_types'
import { TextUtil } from '@botsquad/sdk'
import classNames from 'classnames'
import { FileDownload } from '../icons'

interface Props {
  payload: ContactType['payload']
  metadata: any
  className: string
}

const Contact: React.FC<Props> = ({ payload, metadata, className }) => {
  return (
    <div className={classNames(className, 'text')}>
      <span>
        <div dangerouslySetInnerHTML={TextUtil.processText(metadata?.contact_markdown || 'Contact')} />
        {metadata.vcard && (
          <button
            className="download-vcard"
            onClick={() => {
              const file = new Blob([(metadata?.vcard || '') as string], { type: 'text/vcard' })
              const url = window.URL.createObjectURL(file)

              const a = document.createElement('a')
              a.href = url
              a.download = (payload.name?.formatted_name || 'contact') + '.vcf'
              a.click()
              window.URL.revokeObjectURL(url)
            }}
          >
            {FileDownload}
          </button>
        )}
      </span>
    </div>
  )
}

export default Contact
