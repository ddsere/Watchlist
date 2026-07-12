import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { useAuthStore } from '../../../store/useAuthStore';
import { getUserWatchlist, getUserReviews, deleteReview, updateReview } from '../../../services/firestore';

export default function Profile() {
  const { user, logout } = useAuthStore();
  
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
      if (user?.uid) {
        fetchProfileData();
      }
    }, [user])
  );

  const fetchProfileData = async () => {
    setLoading(true);
    if (user?.uid) {
      const [watchlistData, reviewsData] = await Promise.all([
        getUserWatchlist(user.uid),
        getUserReviews(user.uid)
      ]);

      const toWatchCount = watchlistData.filter(m => m.status === 'to_watch').length;
      const watchedCount = watchlistData.filter(m => m.status === 'watched').length;
      
      setStats({
        toWatch: toWatchCount,
        watched: watchedCount,
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
          try {
            await signOut(auth);
            logout();
            router.replace('/(auth)/login' as any);
          } catch (error) {
            console.error("Logout Error:", error);
          }
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
          } else {
            Alert.alert("Error", "Failed to delete review.");
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

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingReviewId(null);
    setEditRating(0);
    setEditText('');
  };

  const handleUpdateReview = async () => {
    if (editRating === 0 || !editText.trim() || !editingReviewId) return;
    
    setEditLoading(true);
    const success = await updateReview(editingReviewId, editRating, editText);
    
    if (success) {
      setMyReviews(prev => prev.map(r => r.id === editingReviewId ? { ...r, rating: editRating, text: editText } : r));
      closeEditModal();
    } else {
      Alert.alert("Error", "Failed to update review.");
    }
    setEditLoading(false);
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 mx-4">
      <View className="flex-row items-center mb-3 pb-3 border-b border-slate-700">
        <Image 
          source={{ uri: item.moviePoster ? `https://image.tmdb.org/t/p/w92${item.moviePoster}` : 'https://via.placeholder.com/92x138' }}
          className="w-10 h-14 rounded-md mr-3 bg-slate-700"
        />
        <View className="flex-1">
          <Text className="text-white font-bold" numberOfLines={1}>{item.movieTitle}</Text>
          <View className="flex-row mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={12} color="#eab308" />
            ))}
          </View>
        </View>
        <View className="flex-row gap-4 ml-2">
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={18} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteReview(item.id)}>
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-slate-300 text-sm leading-5">{item.text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <FlatList
        data={myReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pt-12 pb-6">
            <View className="items-center px-4 mb-6">
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} className="w-24 h-24 rounded-full border-2 border-red-500 mb-3" />
              ) : (
                <View className="w-24 h-24 bg-red-500 rounded-full justify-center items-center mb-3">
                  <Text className="text-white text-4xl font-bold">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </Text>
                </View>
              )}
              <Text className="text-white font-bold text-2xl mb-1">{user?.displayName || 'User'}</Text>
              <Text className="text-slate-400 text-sm">{user?.email}</Text>
            </View>

            <View className="flex-row justify-between bg-slate-800 rounded-2xl p-4 mx-4 mb-8 border border-slate-700">
              <View className="items-center flex-1">
                <Text className="text-red-500 font-bold text-2xl mb-1">{stats.toWatch}</Text>
                <Text className="text-slate-400 text-xs text-center">To Watch</Text>
              </View>
              <View className="w-[1px] bg-slate-700 mx-2" />
              <View className="items-center flex-1">
                <Text className="text-green-500 font-bold text-2xl mb-1">{stats.watched}</Text>
                <Text className="text-slate-400 text-xs text-center">Watched</Text>
              </View>
              <View className="w-[1px] bg-slate-700 mx-2" />
              <View className="items-center flex-1">
                <Text className="text-yellow-500 font-bold text-2xl mb-1">{stats.reviewCount}</Text>
                <Text className="text-slate-400 text-xs text-center">Reviews</Text>
              </View>
            </View>

            <Text className="text-white font-bold text-xl px-4 mb-4">My Reviews</Text>
            
            {myReviews.length === 0 && (
              <View className="items-center opacity-50 py-10">
                <Ionicons name="chatbubble-ellipses-outline" size={60} color="#94a3b8" />
                <Text className="text-slate-400 mt-4">You haven't written any reviews yet.</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="px-4 pb-20 pt-6">
            <TouchableOpacity 
              className="bg-slate-800 border border-slate-700 py-4 rounded-xl flex-row justify-center items-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-500 font-bold text-lg">Logout</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-xl">Edit Review</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mb-6 space-x-2 gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
                  <Ionicons name={star <= editRating ? "star" : "star-outline"} size={40} color="#eab308" />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-slate-800 text-white p-4 rounded-xl mb-6 border border-slate-700 h-32"
              placeholder="Update your review..."
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={editText}
              onChangeText={setEditText}
            />

            <TouchableOpacity 
              className="bg-red-500 py-4 rounded-xl items-center"
              onPress={handleUpdateReview}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Update Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}