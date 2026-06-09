export type ContentArticle = {
  id: string;
  title: string;
  highlightWord?: string;
  summary: string;
  category: string;
  tags: string[];
  readTime: string;
  badge?: string;
  imageUrl: string;
  imageAlt: string;
  quote: string;
  status?: "archived" | "pending-review" | "published";
  sections: Array<{
    title?: string;
    paragraphs?: string[];
    items?: Array<{
      title: string;
      text: string;
    }>;
  }>;
};
