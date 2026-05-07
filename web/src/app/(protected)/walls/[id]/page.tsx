import { redirect } from 'next/navigation'

export default function WallIdRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/sectors?wallId=${params.id}`)
}
