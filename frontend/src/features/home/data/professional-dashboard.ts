import { communityComments } from "@/features/community/data/community-comments";
import { communityPosts } from "@/features/community/data/community-posts";
import type { CommunityComment, CommunityPost } from "@/features/community/types";
import type { CommunityPreview, HelpRequest } from "@/features/home/types";

export type ProfessionalDashboardData = {
  badge: string;
  community: CommunityPreview;
  discussionCount: number;
  helpRequests: HelpRequest[];
  participatedPostsCount: number;
  receivedSupportCount: number;
  recentPostId?: string;
  specialtyLabel: string;
};

export function parseCreatedCommunityPosts(snapshot: string) {
  try {
    const parsedPosts = JSON.parse(snapshot);
    const fixedPostIds = new Set(communityPosts.map((post) => post.id));

    return Array.isArray(parsedPosts)
      ? (parsedPosts as CommunityPost[]).filter(
          (post) => typeof post.id === "string" && !fixedPostIds.has(post.id)
        )
      : [];
  } catch {
    return [];
  }
}

export function parseSupportedPostIds(snapshot: string) {
  try {
    const parsedPostIds = JSON.parse(snapshot);

    return Array.isArray(parsedPostIds)
      ? parsedPostIds.filter((postId): postId is string => typeof postId === "string")
      : [];
  } catch {
    return [];
  }
}

function normalizeComparisonValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesAnyAuthor(authorName: string, authorNames: string[]) {
  const normalizedAuthorName = normalizeComparisonValue(authorName);

  return authorNames.some((currentName) => {
    const normalizedCurrentName = normalizeComparisonValue(currentName);

    return normalizedCurrentName.length > 0 && normalizedAuthorName === normalizedCurrentName;
  });
}

function getProfessionalVerificationBadge(status: string) {
  if (status === "verified") {
    return "Especialista verificada";
  }

  if (status === "verifying") {
    return "Verificação em análise";
  }

  return "Não verificada";
}

function getProfessionalSpecialtyLabel(specialty: string) {
  const normalizedSpecialty = specialty.trim();

  if (!normalizedSpecialty || normalizedSpecialty === "Nenhuma") {
    return "Especialidade não informada";
  }

  return normalizedSpecialty;
}

function getCommentRecencyInMinutes(comment: CommunityComment) {
  const timeAgo = normalizeComparisonValue(comment.timeAgo);

  if (timeAgo === "agora") {
    return 0;
  }

  const amount = Number.parseInt(timeAgo.match(/\d+/)?.[0] ?? "9999", 10);

  if (timeAgo.includes("min")) {
    return amount;
  }

  if (timeAgo.includes("h")) {
    return amount * 60;
  }

  if (timeAgo.includes("dia")) {
    return amount * 1440;
  }

  return 9999;
}

function mapSupportPostToHelpRequest(post: CommunityPost): HelpRequest {
  return {
    id: post.id,
    title: post.title,
    timeAgo: post.timeAgo,
    category: post.categoryLabel,
    message: post.message,
  };
}

export function buildProfessionalDashboardData({
  avatars,
  displayName,
  fallbackDisplayName,
  posts,
  specialty,
  status,
  supportedPostIds,
}: {
  avatars: string[];
  displayName: string;
  fallbackDisplayName?: string;
  posts: CommunityPost[];
  specialty: string;
  status: string;
  supportedPostIds: string[];
}): ProfessionalDashboardData {
  const professionalAuthorNames = [displayName, fallbackDisplayName ?? ""].filter(Boolean);
  const postById = new Map(posts.map((post) => [post.id, post]));
  const authoredPosts = posts.filter((post) =>
    matchesAnyAuthor(post.authorName, professionalAuthorNames)
  );
  const professionalComments = communityComments.filter((comment) =>
    matchesAnyAuthor(comment.authorName, professionalAuthorNames)
  );
  const commentsInMotherPosts = professionalComments.filter((comment) => {
    const relatedPost = postById.get(comment.postId);

    return (
      !relatedPost ||
      (relatedPost.category !== "profissional" &&
        !matchesAnyAuthor(relatedPost.authorName, professionalAuthorNames))
    );
  });
  const supportedPosts = supportedPostIds
    .map((postId) => postById.get(postId))
    .filter((post): post is CommunityPost => Boolean(post));
  const participatedPostIds = new Set([
    ...authoredPosts.map((post) => post.id),
    ...professionalComments.map((comment) => comment.postId),
    ...supportedPosts.map((post) => post.id),
  ]);
  const receivedSupportCount = authoredPosts.reduce(
    (total, post) => total + post.supportCount,
    0
  );
  const helpRequests = posts
    .filter((post) => post.category === "apoio")
    .slice(0, 4)
    .map(mapSupportPostToHelpRequest);
  const latestSupportedPost = supportedPosts[0];
  const latestComment = [...commentsInMotherPosts].sort(
    (firstComment, secondComment) =>
      getCommentRecencyInMinutes(firstComment) - getCommentRecencyInMinutes(secondComment)
  )[0];
  const latestCommentPost = latestComment ? postById.get(latestComment.postId) : undefined;
  const recentPost = latestSupportedPost ?? latestCommentPost;
  const community = recentPost
    ? {
        title: latestSupportedPost ? "Você apoiou uma mãe" : "Você participou de uma conversa",
        topic: latestSupportedPost
          ? `Última atividade: apoio em "${recentPost.title}".`
          : `Última atividade: comentário em "${recentPost.title}".`,
        activeMothers: recentPost.repliesCount,
        avatars,
        ctaLabel: "Ver conversa",
      }
    : {
        title: "Ajude a primeira mãe no app",
        topic:
          "A comunidade tem pedidos recentes esperando uma orientação cuidadosa. Comece por uma resposta simples e acolhedora.",
        avatars,
        badgeLabel: "Comece por aqui",
        ctaLabel: "Ir para a comunidade",
      };

  return {
    badge: getProfessionalVerificationBadge(status),
    community,
    discussionCount: commentsInMotherPosts.length,
    helpRequests,
    participatedPostsCount: participatedPostIds.size,
    receivedSupportCount,
    recentPostId: recentPost?.id,
    specialtyLabel: getProfessionalSpecialtyLabel(specialty),
  };
}
