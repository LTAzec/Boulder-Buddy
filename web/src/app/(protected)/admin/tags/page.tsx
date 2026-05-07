import { listTags } from '@/actions/tag.actions'
import { requireRole } from '@/lib/requireRole'
import { TagsCrudClient } from './tags-crud-client'

export default async function TagsPage() {
  await requireRole(['Admin'])

  const tags = await listTags()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Tags</h1>
      <TagsCrudClient tags={tags} />
    </div>
  )
}