import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { collection, addDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';

export const toggleWatchlistStatus = async (uid: string, movie: any, status: 'to_watch' | 'watched' | null) => {
  try {
    const docRef = doc(db, 'users', uid, 'watchlist', movie.id.toString());
    
    if (status === null) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        status: status,
        updatedAt: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return false;
  }
};

export const getWatchlistStatus = async (uid: string, movieId: number) => {
  try {
    const docRef = doc(db, 'users', uid, 'watchlist', movieId.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().status;
    }
    return null;
  } catch (error) {
    console.error("Error getting watchlist status:", error);
    return null;
  }
};

export const addReview = async (user: any, movie: any, rating: number, text: string) => {
  try {
    const reviewData = {
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster_path,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'User',
      userAvatar: user.photoURL || null,
      rating: rating,
      text: text,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    return { id: docRef.id, ...reviewData };
  } catch (error) {
    console.error("Error adding review:", error);
    return null;
  }
};

export const getMovieReviews = async (movieId: number) => {
  try {
    const q = query(collection(db, 'reviews'), where("movieId", "==", movieId));
    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting reviews:", error);
    return [];
  }
};

export const updateReview = async (reviewId: string, rating: number, text: string) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, { rating, text, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error("Error updating review:", error);
    return false;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
};

export const getUserWatchlist = async (uid: string) => {
  try {
    const q = collection(db, 'users', uid, 'watchlist');
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Error getting watchlist:", error);
    return [];
  }
};

export const getUserReviews = async (uid: string) => {
  try {
    const q = query(collection(db, 'reviews'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
};

export const getAllReviews = async () => {
  try {
    const q = query(collection(db, 'reviews')); 
    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting all reviews:", error);
    return [];
  }
};