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
    console.log('Buscando restaurante con documentId:', documentId);
    const response = await fetch(
      `${API_URL}/restaurants?filters[documentId][$eq]=${documentId}&populate=*`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log('Respuesta completa de restaurante:', json);

    if (!json.data || !json.data[0]) {
      console.error(
        'No se encontró el restaurante con documentId:',
        documentId
      );
      return null;
    }

    return json.data[0];
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function createReview({
  restaurantId,
  calification,
  typeImprovement = null,
  email = null,
  comment = null,
  googleSent = false,
}: {
  restaurantId: string;
  calification: number;
  typeImprovement?: string | null;
  email?: string | null;
  comment?: string | null;
  googleSent?: boolean;
}) {
  try {
    // Validaciones adicionales a nivel de API
    if (!restaurantId) {
      throw new Error('El ID del restaurante es requerido');
    }

    if (isNaN(parseInt(restaurantId))) {
      throw new Error('El ID del restaurante debe ser un número');
    }

    const reviewData = {
      data: {
        restaurant: parseInt(restaurantId),
        calification,
        googleSent,
        typeImprovement,
        email,
        comment,
        date: new Date().toISOString().split('T')[0],
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
      const errorMessage =
        responseData.error?.message ||
        responseData.error?.details ||
        'Error creando la review';

      console.error('Strapi error response:', responseData);
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}

export async function incrementTaps(documentId: string) {
  try {
    console.log('Intentando incrementar taps para documentId:', documentId);

    // Primero obtener el restaurante actual
    const restaurant = await getRestaurant(documentId);

    if (!restaurant) {
      throw new Error(
        `No se encontró el restaurante con documentId: ${documentId}`
      );
    }

    console.log('Restaurante encontrado:', restaurant);

    // Incrementar taps
    const currentTaps = parseInt(restaurant.attributes.taps || '0');
    const newTaps = currentTaps + 1;

    console.log(`Actualizando taps de ${currentTaps} a ${newTaps}`);

    const updateResponse = await fetch(
      `${API_URL}/restaurants/${restaurant.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            taps: newTaps.toString(),
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Error en la respuesta de actualización:', errorData);
      throw new Error('Error al actualizar taps');
    }

    const result = await updateResponse.json();
    console.log('Actualización exitosa:', result);
    return result;
  } catch (error) {
    console.error('Error incrementando taps:', error);
    throw error;
  }
}
