import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getAllReviews, deleteReview } from '../../services/firestore';

export default function AdminPanel() {
  const { role } = useAuthStore();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (role === 'admin') {
        fetchAllReviews();
      }
    }, [role])
  );

  const fetchAllReviews = async () => {
    setLoading(true);
    const data = await getAllReviews();
    setReviews(data);
    setLoading(false);
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert("Delete Review", "Are you sure you want to permanently delete this review as an Admin?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const success = await deleteReview(reviewId);
          if (success) {
            setReviews(prev => prev.filter(r => r.id !== reviewId));
          } else {
            Alert.alert("Error", "Failed to delete review.");
          }
        }
      }
    ]);
  };

  if (role !== 'admin') {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="shield-half" size={80} color="#ef4444" />
        <Text className="text-red-500 font-bold text-2xl mt-4">Access Denied</Text>
        <Text className="text-slate-400 mt-2 text-center text-lg">
          You do not have administrative privileges to view this page.
        </Text>
      </View>
    );
  }

  const renderReviewItem = ({ item }: { item: any }) => (
    <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 mx-4 flex-row">
      <Image 
        source={{ uri: item.moviePoster ? `https://image.tmdb.org/t/p/w92${item.moviePoster}` : 'https://via.placeholder.com/92x138' }}
        className="w-16 h-24 rounded-md mr-4 bg-slate-700"
      />
      
      <View className="flex-1 justify-between">
        <View>
          <Text className="text-white font-bold mb-1 text-lg" numberOfLines={1}>{item.movieTitle}</Text>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="person-circle-outline" size={14} color="#94a3b8" />
            <Text className="text-slate-400 text-xs ml-1 mr-3 font-semibold">{item.userName}</Text>
            <View className="flex-row bg-slate-900 px-1.5 py-0.5 rounded">
              <Ionicons name="star" size={12} color="#eab308" />
              <Text className="text-yellow-500 text-xs ml-1 font-bold">{item.rating}/5</Text>
            </View>
          </View>

          <Text className="text-slate-300 text-sm leading-5" numberOfLines={3}>{item.text}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleDelete(item.id)} 
        className="ml-2 justify-center items-center px-2"
      >
        <View className="bg-red-500/20 p-2 rounded-full">
          <Ionicons name="trash" size={20} color="#ef4444" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-900 pt-6">
      <View className="px-4 mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-2xl">Moderation Panel</Text>
          <Text className="text-slate-400 text-sm mt-1">Manage all user reviews app-wide</Text>
        </View>
        <Ionicons name="shield-checkmark" size={32} color="#10b981" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : reviews.length === 0 ? (
        <View className="flex-1 justify-center items-center opacity-50 pb-20">
          <Ionicons name="document-text-outline" size={60} color="#94a3b8" />
          <Text className="text-slate-400 mt-4 text-lg">No reviews have been posted yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}