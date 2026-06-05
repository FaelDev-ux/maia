import { contentArticles } from "@/features/contents/data/content-articles";
import type { ContentArticle } from "@/features/contents/types";
import type { HomeProfile, Recommendation } from "@/features/home/types";

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const futureMotherTags = new Set(["planejamento", "futura mãe", "acolhimento", "expectativa realista"]);

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getDateParts(dateKey: string) {
  const [year = "1970", month = "01", day = "01"] = dateKey.split("-");

  return {
    dayNumber: Math.floor(Date.UTC(Number(year), Number(month) - 1, Number(day)) / millisecondsPerDay),
    monthKey: `${year}-${month}`,
  };
}

function getProfileArticlePool(profile: HomeProfile) {
  if (profile !== "future-mother") {
    return contentArticles.filter((article) => !article.tags.some((tag) => futureMotherTags.has(tag)));
  }

  const futureMotherArticles = contentArticles.filter(
    (article) =>
      article.category === "Preparação" ||
      article.tags.some((tag) => futureMotherTags.has(tag)) ||
      article.tags.includes("ansiedade") ||
      article.tags.includes("respiração"),
  );

  return futureMotherArticles.length >= 2 ? futureMotherArticles : contentArticles;
}

function sortArticlesByMonthlySeed(articles: ContentArticle[], profile: HomeProfile, monthKey: string) {
  return [...articles].sort((leftArticle, rightArticle) => {
    const leftHash = hashString(`${monthKey}:${profile}:${leftArticle.id}`);
    const rightHash = hashString(`${monthKey}:${profile}:${rightArticle.id}`);

    return leftHash - rightHash;
  });
}

function articleToRecommendation(article: ContentArticle): Recommendation {
  return {
    id: `daily-${article.id}`,
    contentId: article.id,
    title: article.title.replace(/\.$/, ""),
    description: article.summary,
    duration: article.readTime.replace(" de leitura", ""),
    imageUrl: article.imageUrl,
  };
}

export function getDailyRecommendationsForProfile(
  profile: HomeProfile,
  dateKey: string,
  count = 2,
): Recommendation[] {
  const articlePool = getProfileArticlePool(profile);

  if (articlePool.length === 0) {
    return [];
  }

  const { dayNumber, monthKey } = getDateParts(dateKey);
  const orderedArticles = sortArticlesByMonthlySeed(articlePool, profile, monthKey);
  const startIndex = dayNumber % orderedArticles.length;

  return Array.from({ length: Math.min(count, orderedArticles.length) }, (_, index) => {
    const article = orderedArticles[(startIndex + index) % orderedArticles.length];

    return articleToRecommendation(article);
  });
}
