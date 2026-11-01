import { createClient } from './client'

export interface StorageUploadResult {
  path: string
  name: string
  size: number
  signedUrl?: string
  publicUrl?: string
}

/**
 * Upload candidate resume to the private 'resumes' bucket
 */
export async function uploadResume(file: File, userId: string): Promise<StorageUploadResult> {
  const supabase = createClient()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${userId}/${Date.now()}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw error
  }

  // Generate an initial signed URL for preview
  const { data: signedData } = await supabase.storage
    .from('resumes')
    .createSignedUrl(data.path, 3600)

  return {
    path: data.path,
    name: file.name,
    size: file.size,
    signedUrl: signedData?.signedUrl,
  }
}

/**
 * Upload verification evidence or certificate to the private 'verification_documents' bucket
 */
export async function uploadVerificationDocument(
  file: File,
  userId: string,
  docType: 'evidence' | 'certificate' = 'evidence'
): Promise<StorageUploadResult> {
  const supabase = createClient()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${userId}/${docType}_${Date.now()}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('verification_documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw error
  }

  const { data: signedData } = await supabase.storage
    .from('verification_documents')
    .createSignedUrl(data.path, 3600)

  return {
    path: data.path,
    name: file.name,
    size: file.size,
    signedUrl: signedData?.signedUrl,
  }
}

/**
 * Upload avatar image to the public 'avatars' bucket
 */
export async function uploadAvatar(file: File, userId: string): Promise<StorageUploadResult> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${userId}/avatar_${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw error
  }

  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    name: file.name,
    size: file.size,
    publicUrl: publicData.publicUrl,
  }
}

/**
 * Get signed URL for a private storage object (resume or verification document)
 */
export async function getSignedUrl(bucket: 'resumes' | 'verification_documents', path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error(`Error getting signed URL for ${bucket}/${path}:`, error)
    return null
  }
  return data?.signedUrl || null
}

/**
 * Delete a storage object
 */
export async function deleteStorageFile(bucket: 'resumes' | 'verification_documents' | 'avatars', path: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error(`Error deleting ${bucket}/${path}:`, error)
    return false
  }
  return true
}
