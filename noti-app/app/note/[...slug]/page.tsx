import MarkdownEditor from '@/components/MarkdownEditor';

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const noteSlug = slug.join('/');

  return <MarkdownEditor slug={noteSlug} />;
}
