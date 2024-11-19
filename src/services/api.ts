const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:1337/api';

export async function getRestaurant(restaurantId: string) {
  try {
    const response = await fetch(
      `${API_URL}/restaurants?filters[documentId]=${restaurantId}&populate=*`
    );

    if (!response.ok) {
      throw new Error('Restaurant not found');
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function submitFeedback({
  restaurantId,
  rating,
  improvements,
  comment,
  email,
}: {
  restaurantId: string;
  rating: number;
  improvements?: string[];
  comment?: string;
  email?: string;
}) {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          restaurant: restaurantId,
          rating,
          improvements,
          comment,
          email,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Error submitting feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
