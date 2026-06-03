import { notFound } from "next/navigation";
import { ContentArticlePage } from "@/features/contents/components/ContentArticlePage";
import { contentArticles, getContentArticleById } from "@/features/contents/data/content-articles";
import { resolveProfile } from "@/features/profile/utils/profile-routing";

type ContentArticleRouteProps = {
  params: Promise<{
    contentId: string;
  }>;
  searchParams?: Promise<{
    profile?: string;
  }>;
};

export function generateStaticParams() {
  return contentArticles.map((article) => ({
    contentId: article.id,
  }));
}

export default async function ContentArticleRoute({ params, searchParams }: ContentArticleRouteProps) {
  const { contentId } = await params;
  const resolvedSearchParams = await searchParams;
  const article = getContentArticleById(contentId);

  if (!article) {
    notFound();
  }

  return <ContentArticlePage article={article} profile={resolveProfile(resolvedSearchParams?.profile)} />;
}
