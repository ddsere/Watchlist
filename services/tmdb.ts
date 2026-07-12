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

export const getMovieCredits = async (movieId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`);
    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    return [];
  }
};

export const getMovieGenres = async () => {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const searchMoviesByActor = async (actorName: string) => {
  try {
    const personRes = await fetch(`${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(actorName)}&language=en-US&page=1`);
    const personData = await personRes.json();
    
    if (personData.results && personData.results.length > 0) {
      const personId = personData.results[0].id;
      const creditsRes = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`);
      const creditsData = await creditsRes.json();
      return creditsData.cast || [];
    }
    return [];
  } catch (error) {
    console.error("Error searching by actor:", error);
    return [];
  }
};

export const discoverMoviesByGenre = async (genreId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=1`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error discovering by genre:", error);
    return [];
  }
};