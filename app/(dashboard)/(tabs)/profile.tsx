import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { useAuthStore } from '../../../store/useAuthStore';
import { getUserWatchlist, getUserReviews, deleteReview, updateReview } from '../../../services/firestore';
import { useTheme } from '../../../theme';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ toWatch: 0, watched: 0, reviewCount: 0 });

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) fetchProfileData();
    }, [user])
  );

  const fetchProfileData = async () => {
    setLoading(true);
    if (user?.uid) {
      const [watchlistData, reviewsData] = await Promise.all([
        getUserWatchlist(user.uid),
        getUserReviews(user.uid)
      ]);
      setStats({
        toWatch: watchlistData.filter(m => m.status === 'to_watch').length,
        watched: watchlistData.filter(m => m.status === 'watched').length,
        reviewCount: reviewsData.length
      });
      setMyReviews(reviewsData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
          await signOut(auth);
          logout();
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert("Delete Review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const success = await deleteReview(reviewId);
          if (success) {
            setMyReviews(prev => prev.filter(r => r.id !== reviewId));
            setStats(prev => ({ ...prev, reviewCount: prev.reviewCount - 1 }));
          }
        }
      }
    ]);
  };

  const openEditModal = (review: any) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.text);
    setEditModalVisible(true);
  };

  const handleUpdateReview = async () => {
    if (editRating === 0 || !editText.trim() || !editingReviewId) return;
    setEditLoading(true);
    const success = await updateReview(editingReviewId, editRating, editText);
    if (success) {
      setMyReviews(prev => prev.map(r => r.id === editingReviewId ? { ...r, rating: editRating, text: editText } : r));
      setEditModalVisible(false);
    }
    setEditLoading(false);
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, marginHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Image source={{ uri: item.moviePoster ? `https://image.tmdb.org/t/p/w92${item.moviePoster}` : 'https://via.placeholder.com/92x138' }} style={{ width: 40, height: 56, borderRadius: 6, marginRight: 12, backgroundColor: colors.border }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }} numberOfLines={1}>{item.movieTitle}</Text>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={12} color="#eab308" />
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 16, marginLeft: 8 }}>
          <TouchableOpacity onPress={() => openEditModal(item)}><Ionicons name="pencil" size={18} color={colors.textMuted} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteReview(item.id)}><Ionicons name="trash" size={18} color="#ef4444" /></TouchableOpacity>
        </View>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
    </View>
  );

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={myReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingTop: 48, paddingBottom: 24 }}>
            <View style={{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 24 }}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.primary, marginBottom: 12 }} />
              ) : (
                <View style={{ width: 96, height: 96, backgroundColor: colors.primary, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 'bold' }}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</Text>
                </View>
              )}
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 24, marginBottom: 4 }}>{user?.displayName || 'User'}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>{user?.email}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 32, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 24, marginBottom: 4 }}>{stats.toWatch}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>To Watch</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 8 }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 24, marginBottom: 4 }}>{stats.watched}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Watched</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 8 }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: '#eab308', fontWeight: 'bold', fontSize: 24, marginBottom: 4 }}>{stats.reviewCount}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Reviews</Text>
              </View>
            </View>
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, paddingHorizontal: 16, marginBottom: 16 }}>My Reviews</Text>
            {myReviews.length === 0 && (
              <View style={{ alignItems: 'center', opacity: 0.5, paddingVertical: 40 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={60} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 16 }}>You haven't written any reviews yet.</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16, paddingBottom: 80, paddingTop: 24 }}>
            <TouchableOpacity style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 18 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20 }}>Edit Review</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
                  <Ionicons name={star <= editRating ? "star" : "star-outline"} size={40} color="#eab308" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={{ backgroundColor: colors.background, color: colors.text, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border, height: 120 }} placeholder="Update your review..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" value={editText} onChangeText={setEditText} />
            <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }} onPress={handleUpdateReview} disabled={editLoading}>
              {editLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Update Review</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}