import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMovieDetails, getMovieCredits } from '../../../services/tmdb';
import { getOmdbRatings } from '../../../services/omdb';
import { toggleWatchlistStatus, getWatchlistStatus, addReview, getMovieReviews, updateReview, deleteReview } from '../../../services/firestore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, role } = useAuthStore(); 
  
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [omdbData, setOmdbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [watchStatus, setWatchStatus] = useState<'to_watch' | 'watched' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Review State එක
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    const movieId = parseInt(id as string);
    
    const detailsData = await getMovieDetails(movieId);
    setMovie(detailsData);
    
    if (detailsData) {
      const [castData, omdbRatings, reviewsData] = await Promise.all([
        getMovieCredits(movieId),
        detailsData.imdb_id ? getOmdbRatings(detailsData.imdb_id) : Promise.resolve(null),
        getMovieReviews(movieId) 
      ]);
      setCast(castData);
      setOmdbData(omdbRatings);
      setReviews(reviewsData);
    }
    
    if (user?.uid) {
      const currentStatus = await getWatchlistStatus(user.uid, movieId);
      setWatchStatus(currentStatus);
    }
    
    setLoading(false);
  };

  const handleToggleStatus = async (newStatus: 'to_watch' | 'watched') => {
    if (!user?.uid) return;
    setActionLoading(true);
    const statusToSave = watchStatus === newStatus ? null : newStatus;
    const success = await toggleWatchlistStatus(user.uid, movie, statusToSave);
    if (success) setWatchStatus(statusToSave);
    else Alert.alert("Error", "Failed to update watchlist.");
    setActionLoading(false);
  };

  const handleSaveReview = async () => {
    if (reviewRating === 0) {
      Alert.alert("Required", "Please provide a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert("Required", "Please write a review.");
      return;
    }
    
    setReviewLoading(true);
    if (editingReviewId) {
      // Edit Review
      const success = await updateReview(editingReviewId, reviewRating, reviewText);
      if (success) {
        setReviews(reviews.map(r => r.id === editingReviewId ? { ...r, rating: reviewRating, text: reviewText } : r));
        closeReviewModal();
      } else {
        Alert.alert("Error", "Failed to update review.");
      }
    } else {
      // New Review
      const newReview = await addReview(user, movie, reviewRating, reviewText);
      if (newReview) {
        setReviews([newReview, ...reviews]);
        closeReviewModal();
      } else {
        Alert.alert("Error", "Failed to post review.");
      }
    }
    setReviewLoading(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert("Delete Review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const success = await deleteReview(reviewId);
          if (success) {
            setReviews(reviews.filter(r => r.id !== reviewId));
          } else {
            Alert.alert("Error", "Failed to delete review.");
          }
        }
      }
    ]);
  };

  const openEditModal = (review: any) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewText(review.text);
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewText('');
  };

  const getRatingValue = (source: string) => {
    if (!omdbData || !omdbData.Ratings) return 'N/A';
    const rating = omdbData.Ratings.find((r: any) => r.Source === source);
    return rating ? rating.Value : 'N/A';
  };

  if (loading || !movie) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative mb-16">
          <TouchableOpacity className="absolute top-12 left-4 z-10 bg-black/50 p-2 rounded-full" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }} className="w-full h-64 bg-slate-800" resizeMode="cover" />
          <View className="absolute w-full h-64 bg-slate-900/40" />
          <View className="absolute -bottom-12 left-4 flex-row items-end">
            <Image source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }} className="w-32 h-48 rounded-xl border-2 border-slate-900 bg-slate-700" resizeMode="cover" />
            <View className="ml-4 flex-1 pb-2">
              <Text className="text-white font-bold text-2xl" numberOfLines={2}>{movie.title}</Text>
              <Text className="text-slate-400 text-base font-semibold">
                {movie.release_date ? movie.release_date.substring(0, 4) : ''} • {movie.runtime ? `${movie.runtime} min` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          <View className="flex-row flex-wrap mb-4">
            {movie.genres?.map((genre: any) => (
              <View key={genre.id} className="bg-slate-800 px-3 py-1 rounded-full mr-2 mb-2 border border-slate-700">
                <Text className="text-slate-300 text-xs font-semibold">{genre.name}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-start mb-6 space-x-4 gap-4">
            <View className="items-center">
              <Text className="text-yellow-500 font-bold text-lg">{getRatingValue("Internet Movie Database")}</Text>
              <Text className="text-slate-500 text-[10px]">IMDb</Text>
            </View>
            <View className="items-center">
              <Text className="text-red-500 font-bold text-lg">{getRatingValue("Rotten Tomatoes")}</Text>
              <Text className="text-slate-500 text-[10px]">Rotten Tomatoes</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-500 font-bold text-lg">{getRatingValue("Metacritic")}</Text>
              <Text className="text-slate-500 text-[10px]">Metacritic</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <TouchableOpacity className={`flex-1 p-3 rounded-xl mr-2 items-center border ${watchStatus === 'to_watch' ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700'}`} onPress={() => handleToggleStatus('to_watch')} disabled={actionLoading}>
              <Ionicons name={watchStatus === 'to_watch' ? "bookmark" : "add"} size={20} color={watchStatus === 'to_watch' ? "#ef4444" : "#94a3b8"} />
              <Text className={`text-xs font-bold mt-1 ${watchStatus === 'to_watch' ? 'text-red-500' : 'text-slate-400'}`}>{watchStatus === 'to_watch' ? 'In Watchlist' : 'Watchlist'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`flex-1 p-3 rounded-xl mr-2 items-center border ${watchStatus === 'watched' ? 'bg-green-500/20 border-green-500' : 'bg-slate-800 border-slate-700'}`} onPress={() => handleToggleStatus('watched')} disabled={actionLoading}>
              <Ionicons name={watchStatus === 'watched' ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={watchStatus === 'watched' ? "#10b981" : "#94a3b8"} />
              <Text className={`text-xs font-bold mt-1 ${watchStatus === 'watched' ? 'text-green-500' : 'text-slate-400'}`}>Watched</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-red-500 p-3 rounded-xl items-center justify-center" onPress={() => setReviewModalVisible(true)}>
              <Ionicons name="pencil" size={20} color="white" />
              <Text className="text-white text-xs font-bold mt-1">Review</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-bold mb-2">Overview</Text>
          <Text className="text-slate-400 text-sm leading-6 mb-6">{movie.overview}</Text>

          <Text className="text-white text-lg font-bold mb-3">Cast</Text>
          <FlatList
            data={cast.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="w-20 mr-4 items-center">
                <Image source={{ uri: item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : 'https://via.placeholder.com/150' }} className="w-16 h-16 rounded-full bg-slate-700 mb-2" resizeMode="cover" />
                <Text className="text-white text-xs text-center font-semibold" numberOfLines={2}>{item.name}</Text>
                <Text className="text-slate-500 text-[10px] text-center mt-1" numberOfLines={2}>{item.character}</Text>
              </View>
            )}
            className="mb-6"
          />

          <Text className="text-white text-lg font-bold mb-4">Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text className="text-slate-500 italic text-center py-4 mb-8">No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center">
                    {review.userAvatar ? (
                      <Image source={{ uri: review.userAvatar }} className="w-8 h-8 rounded-full mr-3" />
                    ) : (
                      <View className="w-8 h-8 rounded-full bg-red-500 justify-center items-center mr-3">
                        <Text className="text-white font-bold">{review.userName.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View>
                      <Text className="text-white font-bold">{review.userName}</Text>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons key={star} name={star <= review.rating ? "star" : "star-outline"} size={12} color="#eab308" />
                        ))}
                      </View>
                    </View>
                  </View>

                  <View className="flex-row">
                    {review.userId === user?.uid && (
                      <TouchableOpacity onPress={() => openEditModal(review)} className="mr-3">
                        <Ionicons name="pencil" size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                    {(review.userId === user?.uid || role === 'admin') && (
                      <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
                        <Ionicons name="trash" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text className="text-slate-300 text-sm leading-5">{review.text}</Text>
              </View>
            ))
          )}
          <View className="h-10" />
        </View>
      </ScrollView>

      <Modal visible={isReviewModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-xl">{editingReviewId ? 'Edit Review' : 'Write a Review'}</Text>
              <TouchableOpacity onPress={closeReviewModal}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 mb-2 font-bold text-center">Tap to Rate</Text>
            <View className="flex-row justify-center mb-6 space-x-2 gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={40} color="#eab308" />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-slate-800 text-white p-4 rounded-xl mb-6 border border-slate-700 h-32"
              placeholder="What did you think of the movie?"
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity 
              className="bg-red-500 py-4 rounded-xl items-center"
              onPress={handleSaveReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Save Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}