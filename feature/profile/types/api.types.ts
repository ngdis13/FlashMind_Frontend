export interface ProfileResponse {
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  review_series: number;
  total_reviews: number;
  daily_review_counts: {
    [date: string]: number;
  };
}
