import Link from 'next/link'
export default function NotFound() {
  return <section className="container-site py-28"><h1 className="text-5xl font-semibold">Sidan finns inte</h1><p className="mt-4 text-muted-foreground">Sidan du letar efter finns inte eller har flyttats.</p><Link href="/" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground">Till startsidan</Link></section>
}
