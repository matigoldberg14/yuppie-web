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
