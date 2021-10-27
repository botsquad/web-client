export function uploadFile(file, signed_request, resolve, reject, progressHandler, contentType) {
  let error = false

  const xhr = new XMLHttpRequest()
  xhr.open('PUT', signed_request)

  if (contentType) {
    xhr.setRequestHeader('content-type', contentType)
  }

  xhr.upload.onprogress = evt => {
    if (evt.lengthComputable && progressHandler && !error) {
      progressHandler((evt.loaded / evt.total) * 100)
    }
  }

  xhr.onload = () => {
    if (xhr.status === 200) {
      resolve(signed_request.replace(/\?.*$/, ''))
    }
  }

  xhr.onerror = err => {
    error = true
    if (reject) {
      setTimeout(() => reject(err), 0)
    }
  }

  xhr.send(file)
}
