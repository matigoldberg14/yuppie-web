const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:1337/api';

export async function getAllRestaurants() {
  try {
    const response = await fetch(`${API_URL}/restaurants?populate=*`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}

export async function getRestaurant(documentId: string) {
  try {
    const response = await fetch(
      `${API_URL}/restaurants?filters[documentId][$eq]=${documentId}&populate=*`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data[0];
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function createReview({
  restaurantId,
  typeImprovement,
  email,
  comment,
}: {
  restaurantId: string;
  typeImprovement: string;
  email: string;
  comment: string;
}) {
  try {
    // Generar un documentId único
    const documentId = 'rev_' + Math.random().toString(36).substr(2, 9);

    const reviewData = {
      data: {
        googleSent: false,
        typeImprovement,
        email,
        date: new Date(),
        comment,
        restaurant: restaurantId, // Relación directa con el ID del restaurante.
      },
    };

    console.log('Sending to Strapi:', JSON.stringify(reviewData, null, 2));

    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Strapi error response:', responseData);
      throw new Error(
        responseData.error?.message ||
          JSON.stringify(responseData.error?.details) ||
          'Error creating review'
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
