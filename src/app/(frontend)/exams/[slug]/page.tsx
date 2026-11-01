import { redirect } from 'next/navigation'

export default async function ExamSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Route to the canonical track detail view
  redirect(`/interview-tracks/${slug}`)
}
