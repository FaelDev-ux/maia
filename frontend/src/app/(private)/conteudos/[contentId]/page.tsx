import { notFound } from "next/navigation";
import { ContentArticlePage } from "@/features/contents/components/ContentArticlePage";
import { contentArticles, getContentArticleById } from "@/features/contents/data/content-articles";

type ContentArticleRouteProps = {
  params: Promise<{
    contentId: string;
  }>;
};

export function generateStaticParams() {
  return contentArticles.map((article) => ({
    contentId: article.id,
  }));
}

export default async function ContentArticleRoute({ params }: ContentArticleRouteProps) {
  const { contentId } = await params;
  const article = getContentArticleById(contentId);

  if (!article) {
    notFound();
  }

  return <ContentArticlePage article={article} />;
}
