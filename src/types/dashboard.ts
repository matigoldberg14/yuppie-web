// src/types/dashboard.ts
export interface RestaurantData {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

export interface RestaurantStats {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  taps: number;
}

export interface Review {
  id: number;
  calification: number;
  comment: string;
  createdAt: string;
}
