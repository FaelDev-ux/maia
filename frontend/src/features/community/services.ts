import { apiFetch } from "@/services/api/client";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostCategory,
} from "@/features/community/types";

type ApiPost = Partial<CommunityPost> & {
  anonymous?: boolean;
  body?: string;
  commentsCount?: number;
  createdAt?: string;
};

type ApiComment = Partial<CommunityComment> & {
  body?: string;
  createdAt?: string;
};

type PostsResponse = {
  items?: ApiPost[];
  posts?: ApiPost[];
};

type PostResponse = {
  comments?: ApiComment[];
  post?: ApiPost;
};

type CreatePostResponse = {
  post?: ApiPost;
};

type CreateCommentResponse = {
  comment?: ApiComment;
};

type SupportResponse = {
  supportCount?: number;
  supported?: boolean;
};

const categoryLabels: Record<CommunityPostCategory, string> = {
  apoio: "Preciso de apoio",
  profissional: "Orientacao cuidadosa",
  rede: "Rede de apoio",
  sono: "Sono e rotina",
};

function isCommunityCategory(value: unknown): value is CommunityPostCategory {
  return value === "apoio" || value === "sono" || value === "rede" || value === "profissional";
}

function getInitials(name?: string) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) {
    return "M";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getTimeAgo(value?: string) {
  if (!value) {
    return "agora";
  }

  const createdAt = new Date(value).getTime();

  if (!Number.isFinite(createdAt)) {
    return "agora";
  }

  const diffInMinutes = Math.max(Math.floor((Date.now() - createdAt) / 60000), 0);

  if (diffInMinutes < 1) {
    return "agora";
  }

  if (diffInMinutes < 60) {
    return `ha ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `ha ${diffInHours} h`;
  }

  return `ha ${Math.floor(diffInHours / 24)} d`;
}

export function normalizeCommunityPost(post: ApiPost): CommunityPost {
  const category = isCommunityCategory(post.category) ? post.category : "apoio";
  const authorName = post.authorName ?? "Usuario Maia";

  return {
    id: post.id ?? `post-${Date.now()}`,
    authorName,
    authorRole: post.authorRole ?? "Comunidade Maia",
    avatarInitials: post.avatarInitials ?? getInitials(authorName),
    category,
    categoryLabel: post.categoryLabel ?? categoryLabels[category],
    highlightedReply: post.highlightedReply,
    isAnonymous: post.isAnonymous ?? post.anonymous,
    message: post.message ?? post.body ?? "",
    repliesCount: Number(post.repliesCount ?? post.commentsCount ?? 0),
    supportCount: Number(post.supportCount ?? 0),
    tags: Array.isArray(post.tags) ? post.tags : [],
    timeAgo: post.timeAgo ?? getTimeAgo(post.createdAt),
    title: post.title ?? "Publicacao Maia",
  };
}

export function normalizeCommunityComment(comment: ApiComment): CommunityComment {
  const authorName = comment.authorName ?? "Usuario Maia";

  return {
    id: comment.id ?? `comment-${Date.now()}`,
    postId: comment.postId ?? "",
    authorName,
    authorRole: comment.authorRole ?? "Comunidade Maia",
    avatarInitials: comment.avatarInitials ?? getInitials(authorName),
    helpfulCount: Number(comment.helpfulCount ?? 0),
    isAnonymous: comment.isAnonymous,
    message: comment.message ?? comment.body ?? "",
    notHelpfulCount: Number(comment.notHelpfulCount ?? 0),
    status:
      comment.status === "hidden" || comment.status === "removed" ? comment.status : "active",
    timeAgo: comment.timeAgo ?? getTimeAgo(comment.createdAt),
    userVote: comment.userVote,
  };
}

export async function fetchCommunityPosts() {
  const data = await apiFetch<PostsResponse>(
    "/api/community/posts",
    undefined,
    "Nao foi possivel carregar a comunidade."
  );

  return (data.posts ?? data.items ?? []).map(normalizeCommunityPost);
}

export async function fetchCommunityPostDetail(postId: string) {
  const data = await apiFetch<PostResponse>(
    `/api/community/posts/${postId}`,
    undefined,
    "Nao foi possivel carregar esta conversa."
  );

  return {
    comments: (data.comments ?? []).map(normalizeCommunityComment),
    post: data.post ? normalizeCommunityPost(data.post) : null,
  };
}

export async function createCommunityPost(payload: {
  category: CommunityPostCategory;
  isAnonymous: boolean;
  message: string;
  tags: string[];
  title: string;
}) {
  const data = await apiFetch<CreatePostResponse>(
    "/api/community/posts",
    {
      body: JSON.stringify({
        anonymous: payload.isAnonymous,
        category: payload.category,
        isAnonymous: payload.isAnonymous,
        message: payload.message,
        tags: payload.tags,
        title: payload.title,
      }),
      method: "POST",
    },
    "Nao foi possivel publicar agora."
  );

  return data.post ? normalizeCommunityPost(data.post) : null;
}

export async function createCommunityComment(postId: string, message: string) {
  const data = await apiFetch<CreateCommentResponse>(
    `/api/community/posts/${postId}/comments`,
    {
      body: JSON.stringify({ message }),
      method: "POST",
    },
    "Nao foi possivel enviar sua resposta agora."
  );

  return data.comment ? normalizeCommunityComment(data.comment) : null;
}

export async function toggleCommunitySupport(postId: string) {
  return apiFetch<SupportResponse>(
    `/api/community/posts/${postId}/support`,
    {
      body: JSON.stringify({ supported: true }),
      method: "POST",
    },
    "Nao foi possivel registrar seu apoio agora."
  );
}

export async function deleteCommunityPost(postId: string) {
  await apiFetch(
    `/api/community/posts/${postId}`,
    {
      method: "DELETE",
    },
    "Nao foi possivel remover esta publicacao agora."
  );
}

export async function sendCommentFeedback(commentId: string, vote: "helpful" | "not-helpful") {
  await apiFetch(
    `/api/community/comments/${commentId}/feedback`,
    {
      body: JSON.stringify({ helpful: vote === "helpful", vote }),
      method: "POST",
    },
    "Nao foi possivel registrar seu retorno agora."
  );
}
