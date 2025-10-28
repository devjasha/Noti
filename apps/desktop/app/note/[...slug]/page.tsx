import { redirect } from 'next/navigation';

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const noteSlug = slug.join('/');

  // Redirect to dashboard with the note selected
  redirect(`/dashboard?note=${noteSlug}`);
}
