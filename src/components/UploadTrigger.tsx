import { useRef, useState, useImperativeHandle, forwardRef } from 'react'

export type Callback = ((file: any) => void) | null
export type Capture = 'user' | 'environment'

export interface UploadTriggerRef {
  trigger: (accept: string, callback: Callback, capture?: Capture) => void
}

const UploadTrigger = forwardRef<UploadTriggerRef, Record<string, unknown>>((_, ref) => {
  const [accept, setAccept] = useState<string>('')
  const [uploadCount, setUploadCount] = useState<number>(0)
  const [capture, setCapture] = useState<Capture | undefined>(undefined)
  const callbackRef = useRef<Callback>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    trigger: (accept: string, callback: Callback, capture?: Capture) => {
      callbackRef.current = callback
      setAccept(accept)
      setCapture(capture)
      setTimeout(() => {
        inputRef.current?.click()
      }, 0)
    },
  }))

  const onChange = () => {
    const file = inputRef.current?.files?.[0]
    if (!callbackRef.current || !file) {
      return
    }
    callbackRef.current(file)
    callbackRef.current = null
    setUploadCount((prev) => prev + 1)
  }

  return (
    <input
      key={uploadCount}
      className="upload-trigger"
      onChange={onChange}
      type="file"
      multiple={false}
      accept={accept}
      capture={capture}
      ref={inputRef}
    />
  )
})

UploadTrigger.displayName = 'UploadTrigger'

export default UploadTrigger
