// services/tmdb.ts

const TMDB_API_KEY = '005efcdca039fbdc35656a4929036b2b'; 
const BASE_URL = 'https://api.themoviedb.org/3';

export const getPopularMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

export const getTopRatedMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

export const getRecommendations = async (movieId: number = 27205) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

export const searchMovies = async (query: string) => {
  try {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};