// src/types/metrics.ts
// Type for rating data by period
export interface RatingByPeriod {
  day: number;
  week: number;
  month: number;
  year: number;
}

// Type for reviews data by period
export interface ReviewsByPeriod {
  day: number;
  week: number;
  month: number;
  year: number;
}

// Type for top employee
export interface TopEmployee {
  id: string;
  name: string;
  position: string;
  rating: number;
  reviews: number;
}

// Type for restaurant metrics
export interface RestaurantMetrics {
  documentId: string;
  name: string;
  totalReviews: number;
  averageRating: number;
  employeeCount: number;
  totalTaps: number;
  conversionRate: number;
  positiveReviewsPercent: number;
  reviewsByPeriod: ReviewsByPeriod;
  ratingByPeriod: RatingByPeriod;
  topEmployees: TopEmployee[];
}

// Type for time filter
export type TimeFilter = 'day' | 'week' | 'month' | 'year';

// Type for metrics data
export interface MetricsData {
  totalReviews: number;
  averageRating: number;
  totalTaps: number;
  responseRate: number;
  googleSentRate: number;
  trends: {
    volumeTrend: number;
    ratingTrend: number;
  };
  ratingsDistribution: {
    rating: number;
    count: number;
  }[];
  reviewsByType: {
    type: string;
    count: number;
  }[];
  weekdayAnalysis: Record<
    string,
    {
      count: number;
      averageRating: number;
    }
  >;
  hourlyAnalysis?: Record<
    string,
    {
      count: number;
      averageRating: number;
    }
  >;
}

// Type for metrics history
export interface MetricsHistory {
  dates: string[];
  reviews: number[];
  ratings: number[];
}
