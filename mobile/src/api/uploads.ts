import { apiFetch } from '@/src/api/apiClient'

type UploadResponse = {
  ok: true
  url: string
}

// React Native "file" object voor FormData.
// TS kent dit niet standaard, maar fetch in RN ondersteunt dit wel.
type RNFormDataFile = {
  uri: string
  name: string
  type: string
}

// React Native FormData gebruikt geen echte Blob,
// maar fetch accepteert dit object als file.
// Cast is enkel voor TypeScript.
function asBlob(file: RNFormDataFile): Blob {
  return file as unknown as Blob
}

async function uploadFile(params: {
  endpoint: string
  uri: string
  mimeType: string
  fileName: string
}): Promise<string> {
  const form = new FormData()

  const file: RNFormDataFile = {
    uri: params.uri,
    name: params.fileName,
    type: params.mimeType,
  }

  form.append('file', asBlob(file))

  const res = await apiFetch<UploadResponse>(params.endpoint, {
    method: 'POST',
    body: form,
  })

  return res.url
}

// SECTOR image
export async function uploadSectorImage(params: {
  uri: string
  mimeType?: string
  fileName?: string
}): Promise<string> {
  return uploadFile({
    endpoint: '/api/uploads/sectors',
    uri: params.uri,
    fileName: params.fileName ?? `sector_${Date.now()}.jpg`,
    mimeType: params.mimeType ?? 'image/jpeg',
  })
}

// BOULDER image
export async function uploadBoulderImage(params: {
  uri: string
  mimeType?: string
  fileName?: string
}): Promise<string> {
  return uploadFile({
    endpoint: '/api/uploads/boulders-images',
    uri: params.uri,
    fileName: params.fileName ?? `boulder_${Date.now()}.jpg`,
    mimeType: params.mimeType ?? 'image/jpeg',
  })
}

// BOULDER video
export async function uploadBoulderVideo(params: {
  uri: string
  mimeType?: string
  fileName?: string
}): Promise<string> {
  return uploadFile({
    endpoint: '/api/uploads/boulders-videos',
    uri: params.uri,
    fileName: params.fileName ?? `boulder_${Date.now()}.mp4`,
    mimeType: params.mimeType ?? 'video/mp4',
  })
}
