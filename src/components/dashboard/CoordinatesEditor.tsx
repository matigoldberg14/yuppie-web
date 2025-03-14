// src/services/api.ts
export async function updateRestaurantCoordinates(
  documentId: string,
  coordinates: { latitude: number; longitude: number }
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/restaurants/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            coordinates: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
          },
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error updating coordinates: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error in updateRestaurantCoordinates:', error);
    throw error;
  }
}
