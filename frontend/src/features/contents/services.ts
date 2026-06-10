import { apiFetch } from "@/services/api/client";
import type { ContentArticle } from "@/features/contents/types";
import type { Recommendation } from "@/features/home/types";

type ApiContent = Partial<ContentArticle> & {
  author?: {
    name?: string;
    role?: string;
  };
  body?: string;
  contentId?: string;
  readingTimeMinutes?: number;
  status?: ContentArticle["status"];
};

type ContentsResponse = {
  contents?: ApiContent[];
  items?: ApiContent[];
};

type ContentResponse = {
  content?: ApiContent;
};

type RecommendationsResponse = {
  items?: ApiContent[];
  recommendations?: ApiContent[];
};

function toParagraphs(content: ApiContent) {
  if (content.sections?.length) {
    return content.sections;
  }

  return [
    {
      paragraphs: [
        content.body ??
          content.summary ??
          "Conteudo preparado para apoiar sua jornada com cuidado e linguagem segura.",
      ],
    },
  ];
}

function getReadTime(content: ApiContent) {
  if (content.readTime) {
    return content.readTime;
  }

  const minutes = content.readingTimeMinutes ?? 5;

  return `${minutes} min`;
}

export function normalizeContent(content: ApiContent, index = 0): ContentArticle {
  return {
    id: content.id ?? content.contentId ?? `content-${index}`,
    badge: content.badge ?? content.author?.role,
    category: content.category ?? "Bem-estar",
    highlightWord: content.highlightWord,
    imageAlt: content.imageAlt ?? "",
    imageUrl: content.imageUrl ?? "",
    quote: content.quote ?? "Um passo de cada vez tambem e cuidado.",
    readTime: getReadTime(content),
    sections: toParagraphs(content),
    status: content.status,
    summary: content.summary ?? "",
    tags: Array.isArray(content.tags) ? content.tags : [],
    title: content.title ?? "Conteudo Maia",
  };
}

export async function createContent(payload: {
  body: string;
  category: string;
  readingTimeMinutes: number;
  status?: "published";
  summary: string;
  tags: string[];
  title: string;
}) {
  const data = await apiFetch<ContentResponse>(
    "/api/contents",
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
    "Nao foi possivel criar este conteudo."
  );

  return data.content ? normalizeContent(data.content) : null;
}

export async function updateContentStatus(
  contentId: string,
  status: "archived" | "pending-review" | "published"
) {
  const data = await apiFetch<ContentResponse>(
    `/api/contents/${contentId}`,
    {
      body: JSON.stringify({ status }),
      method: "PATCH",
    },
    "Nao foi possivel atualizar este conteudo."
  );

  return data.content ? normalizeContent(data.content) : null;
}

export async function fetchContents() {
  const data = await apiFetch<ContentsResponse>(
    "/api/contents",
    undefined,
    "Nao foi possivel carregar os conteudos."
  );
  const contents = data.contents ?? data.items ?? [];

  return contents.map(normalizeContent);
}

export async function fetchContentById(contentId: string) {
  const data = await apiFetch<ContentResponse>(
    `/api/contents/${contentId}`,
    undefined,
    "Nao foi possivel carregar este conteudo."
  );

  return data.content ? normalizeContent(data.content) : null;
}

export async function fetchRecommendations() {
  const data = await apiFetch<RecommendationsResponse>(
    "/api/recommendations",
    undefined,
    "Nao foi possivel carregar recomendacoes."
  );
  const recommendations = data.recommendations ?? data.items ?? [];

  return recommendations.map((content, index): Recommendation => {
    const article = normalizeContent(content, index);

    return {
      id: `recommendation-${article.id}`,
      contentId: article.id,
      description: article.summary,
      duration: article.readTime,
      imageUrl: article.imageUrl,
      title: article.title,
    };
  });
}
