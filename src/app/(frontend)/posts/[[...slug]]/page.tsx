import { notFound } from 'next/navigation'

// Reserve the retired blog URLs, including posts and pagination, as real 404s.
export default function RetiredPosts() {
  notFound()
}
