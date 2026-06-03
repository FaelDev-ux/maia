export type CommunityPostCategory = "apoio" | "sono" | "rede" | "profissional";

export type CommunityFilter = {
  id: string;
  label: string;
  active?: boolean;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  authorRole: string;
  avatarInitials: string;
  timeAgo: string;
  category: CommunityPostCategory;
  categoryLabel: string;
  title: string;
  message: string;
  tags: string[];
  supportCount: number;
  repliesCount: number;
  isAnonymous?: boolean;
  highlightedReply?: {
    authorName: string;
    authorRole: string;
    message: string;
  };
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorName: string;
  authorRole: string;
  avatarInitials: string;
  message: string;
  timeAgo: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isAnonymous?: boolean;
  userVote?: "helpful" | "not-helpful";
};
