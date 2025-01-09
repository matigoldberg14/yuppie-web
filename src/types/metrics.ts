// src/types/metrics.ts
export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface MetricsData {
  totalReviews: number;
  averageRating: number;
  totalTaps: number;
  responseRate: number;
  reviewsByType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  ratingsDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: {
    id: number;
    calification: number;
    comment: string;
    email: string;
    date: string;
  }[];
  googleSentRate: number;
  employeePerformance: {
    employeeId: number;
    name: string;
    averageRating: number;
    totalReviews: number;
    responseTime: number;
  }[];
  timeOfDayAnalysis: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  weekdayAnalysis: {
    [key: string]: {
      count: number;
      averageRating: number;
    };
  };
  trends: {
    ratingTrend: number;
    volumeTrend: number;
    responseTimeTrend: number;
  };
}
