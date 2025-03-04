// src/types/restaurant.ts
export type Restaurant = {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    // Nota: documentId podría no existir en la estructura actual
    documentId?: string;
  };
};

export type StrapiResponse = {
  data: Restaurant[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};
