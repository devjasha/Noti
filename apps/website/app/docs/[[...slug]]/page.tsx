import { notFound } from 'next/navigation';
import IntroDoc from '@/content/docs/index.mdx';
import GettingStartedDoc from '@/content/docs/getting-started.mdx';
import MarkdownDoc from '@/content/docs/markdown.mdx';
import GitDoc from '@/content/docs/git.mdx';
import NotiVimDoc from '@/content/docs/noti-vim.mdx';

const docs = {
  '': {
    Component: IntroDoc,
    title: 'Introduction',
    description: 'Welcome to Noti Documentation'
  },
  'getting-started': {
    Component: GettingStartedDoc,
    title: 'Getting Started',
    description: 'Learn how to install and use Noti'
  },
  'markdown': {
    Component: MarkdownDoc,
    title: 'Markdown Features',
    description: "Learn about Noti's rich markdown editor"
  },
  'git': {
    Component: GitDoc,
    title: 'Git Integration',
    description: 'Learn how to use Git features in Noti'
  },
  'noti-vim': {
    Component: NotiVimDoc,
    title: 'noti-vim',
    description: 'Use Noti from Neovim with noti-vim plugin'
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug?.join('/') || '';
  const doc = docs[path as keyof typeof docs];

  if (!doc) notFound();

  const MDX = doc.Component;

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {doc.title}
      </h1>
      {doc.description && (
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {doc.description}
        </p>
      )}
      <MDX />
    </article>
  );
}

export async function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['getting-started'] },
    { slug: ['markdown'] },
    { slug: ['git'] },
    { slug: ['noti-vim'] },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const path = slug?.join('/') || '';
  const doc = docs[path as keyof typeof docs];

  if (!doc) notFound();

  return {
    title: doc.title,
    description: doc.description,
  };
}
