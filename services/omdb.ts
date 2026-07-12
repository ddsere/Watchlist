// services/omdb.ts

const OMDB_API_KEY = 'b27edd69'; 
const BASE_URL = 'https://www.omdbapi.com';

export const getOmdbRatings = async (imdbId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching OMDB ratings:", error);
    return null;
  }
};