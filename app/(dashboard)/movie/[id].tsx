import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMovieDetails, getMovieCredits } from '../../../services/tmdb';
import { getOmdbRatings } from '../../../services/omdb';
import { toggleWatchlistStatus, getWatchlistStatus, addReview, getMovieReviews, updateReview, deleteReview } from '../../../services/firestore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../theme';

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, role } = useAuthStore(); 
  const { colors } = useTheme();
  
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [omdbData, setOmdbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [watchStatus, setWatchStatus] = useState<'to_watch' | 'watched' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
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
    setActionLoading(false);
  };

  const handleSaveReview = async () => {
    if (reviewRating === 0 || !reviewText.trim()) return Alert.alert("Required", "Please provide a rating and a review.");
    setReviewLoading(true);
    if (editingReviewId) {
      const success = await updateReview(editingReviewId, reviewRating, reviewText);
      if (success) {
        setReviews(reviews.map(r => r.id === editingReviewId ? { ...r, rating: reviewRating, text: reviewText } : r));
        closeReviewModal();
      }
    } else {
      const newReview = await addReview(user, movie, reviewRating, reviewText);
      if (newReview) {
        setReviews([newReview, ...reviews]);
        closeReviewModal();
      }
    }
    setReviewLoading(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert("Delete Review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const success = await deleteReview(reviewId);
          if (success) setReviews(reviews.filter(r => r.id !== reviewId));
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

  if (loading || !movie) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative', marginBottom: 64 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 48, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }} style={{ width: '100%', height: 256, backgroundColor: colors.border }} resizeMode="cover" />
          <View style={{ position: 'absolute', width: '100%', height: 256, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <View style={{ position: 'absolute', bottom: -48, left: 16, flexDirection: 'row', alignItems: 'flex-end' }}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }} style={{ width: 128, height: 192, borderRadius: 12, borderWidth: 2, borderColor: colors.background, backgroundColor: colors.border }} resizeMode="cover" />
            <View style={{ marginLeft: 16, flex: 1, paddingBottom: 8 }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 24, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 }} numberOfLines={2}>{movie.title}</Text>
              <Text style={{ color: '#cbd5e1', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 }}>
                {movie.release_date ? movie.release_date.substring(0, 4) : ''} • {movie.runtime ? `${movie.runtime} min` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {movie.genres?.map((genre: any) => (
              <View key={genre.id} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{genre.name}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 24, gap: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#eab308', fontWeight: 'bold', fontSize: 18 }}>{getRatingValue("Internet Movie Database")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>IMDb</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 18 }}>{getRatingValue("Rotten Tomatoes")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Rotten Tomatoes</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 18 }}>{getRatingValue("Metacritic")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Metacritic</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center', borderWidth: 1, backgroundColor: watchStatus === 'to_watch' ? 'rgba(239, 68, 68, 0.1)' : colors.surface, borderColor: watchStatus === 'to_watch' ? colors.primary : colors.border }} onPress={() => handleToggleStatus('to_watch')} disabled={actionLoading}>
              <Ionicons name={watchStatus === 'to_watch' ? "bookmark" : "add"} size={20} color={watchStatus === 'to_watch' ? colors.primary : colors.textMuted} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: watchStatus === 'to_watch' ? colors.primary : colors.textMuted }}>{watchStatus === 'to_watch' ? 'In Watchlist' : 'Watchlist'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center', borderWidth: 1, backgroundColor: watchStatus === 'watched' ? 'rgba(16, 185, 129, 0.1)' : colors.surface, borderColor: watchStatus === 'watched' ? '#10b981' : colors.border }} onPress={() => handleToggleStatus('watched')} disabled={actionLoading}>
              <Ionicons name={watchStatus === 'watched' ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={watchStatus === 'watched' ? '#10b981' : colors.textMuted} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: watchStatus === 'watched' ? '#10b981' : colors.textMuted }}>Watched</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => setReviewModalVisible(true)}>
              <Ionicons name="pencil" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>Review</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Overview</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 24, marginBottom: 24 }}>{movie.overview}</Text>

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Cast</Text>
          <FlatList
            data={cast.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: 80, marginRight: 16, alignItems: 'center' }}>
                <Image source={{ uri: item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : 'https://via.placeholder.com/150' }} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.border, marginBottom: 8 }} resizeMode="cover" />
                <Text style={{ color: colors.text, fontSize: 12, textAlign: 'center', fontWeight: '600' }} numberOfLines={2}>{item.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 }} numberOfLines={2}>{item.character}</Text>
              </View>
            )}
            style={{ marginBottom: 24 }}
          />

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: 16, marginBottom: 32 }}>No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {review.userAvatar ? (
                      <Image source={{ uri: review.userAvatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }} />
                    ) : (
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{review.userName.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>{review.userName}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons key={star} name={star <= review.rating ? "star" : "star-outline"} size={12} color="#eab308" />
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {review.userId === user?.uid && (
                      <TouchableOpacity onPress={() => openEditModal(review)} style={{ marginRight: 12 }}><Ionicons name="pencil" size={18} color={colors.textMuted} /></TouchableOpacity>
                    )}
                    {(review.userId === user?.uid || role === 'admin') && (
                      <TouchableOpacity onPress={() => handleDeleteReview(review.id)}><Ionicons name="trash" size={18} color="#ef4444" /></TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{review.text}</Text>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal visible={isReviewModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20 }}>{editingReviewId ? 'Edit Review' : 'Write a Review'}</Text>
              <TouchableOpacity onPress={closeReviewModal}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={40} color="#eab308" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={{ backgroundColor: colors.background, color: colors.text, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border, height: 120 }} placeholder="What did you think of the movie?" placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" value={reviewText} onChangeText={setReviewText} />
            <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }} onPress={handleSaveReview} disabled={reviewLoading}>
              {reviewLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Save Review</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}