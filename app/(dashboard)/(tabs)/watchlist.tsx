import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserWatchlist, toggleWatchlistStatus } from '../../../services/firestore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function Watchlist() {
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'to_watch' | 'watched'>('to_watch');
  
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        fetchWatchlist();
      }
    }, [user])
  );

  const fetchWatchlist = async () => {
    setLoading(true);
    if (user?.uid) {
      const data = await getUserWatchlist(user.uid);
      setWatchlistData(data);
    }
    setLoading(false);
  };

  const filteredList = watchlistData.filter(movie => movie.status === activeTab);

  const handleMove = async (movie: any) => {
    if (!user?.uid) return;
    const newStatus = activeTab === 'to_watch' ? 'watched' : 'to_watch';
    
    setWatchlistData(prev => prev.map(m => m.movieId === movie.movieId ? { ...m, status: newStatus } : m));
    
    const success = await toggleWatchlistStatus(user.uid, { id: movie.movieId, ...movie }, newStatus);
    if (!success) {
      Alert.alert("Error", "Failed to move movie.");
      fetchWatchlist(); 
    }
  };

  const handleRemove = (movie: any) => {
    Alert.alert("Remove Movie", `Are you sure you want to remove "${movie.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
          if (!user?.uid) return;
          
          setWatchlistData(prev => prev.filter(m => m.movieId !== movie.movieId));
          
          const success = await toggleWatchlistStatus(user.uid, { id: movie.movieId }, null);
          if (!success) {
            Alert.alert("Error", "Failed to remove movie.");
            fetchWatchlist();
          }
        }
      }
    ]);
  };

  const renderMovieCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row bg-slate-800 rounded-xl mb-4 overflow-hidden border border-slate-700 mx-4"
      onPress={() => router.push({ pathname: '/(dashboard)/movie/[id]' as any, params: { id: item.movieId } })}
    >
      <Image 
        source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster' }}
        className="w-24 h-36 bg-slate-700"
        resizeMode="cover"
      />
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-white font-bold text-lg mb-1" numberOfLines={2}>{item.title}</Text>
          <View className="flex-row justify-between items-center pr-2">
            <Text className="text-slate-400 text-sm">{item.release_date ? item.release_date.substring(0, 4) : 'N/A'}</Text>
            <View className="flex-row items-center bg-slate-900 px-2 py-1 rounded-md">
              <Ionicons name="star" size={12} color="#eab308" />
              <Text className="text-yellow-500 font-bold text-xs ml-1">
                {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-end mt-2 space-x-3 gap-3">
          <TouchableOpacity 
            className={`px-3 py-1.5 rounded-lg flex-row items-center ${activeTab === 'to_watch' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
            onPress={() => handleMove(item)}
          >
            <Ionicons name={activeTab === 'to_watch' ? "checkmark-circle" : "bookmark"} size={16} color={activeTab === 'to_watch' ? "#10b981" : "#ef4444"} />
            <Text className={`text-xs font-bold ml-1 ${activeTab === 'to_watch' ? 'text-green-500' : 'text-red-500'}`}>
              {activeTab === 'to_watch' ? 'Mark Watched' : 'To Watch'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="px-3 py-1.5 bg-slate-700 rounded-lg flex-row items-center"
            onPress={() => handleRemove(item)}
          >
            <Ionicons name="close" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900 pt-12">
      <Text className="text-white font-bold text-2xl mb-4 px-4">My Lists</Text>

      <View className="flex-row bg-slate-800 p-1 rounded-xl mx-4 mb-6 border border-slate-700">
        <TouchableOpacity 
          className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'to_watch' ? 'bg-red-500' : 'bg-transparent'}`}
          onPress={() => setActiveTab('to_watch')}
        >
          <Text className={`font-bold ${activeTab === 'to_watch' ? 'text-white' : 'text-slate-400'}`}>To Watch</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'watched' ? 'bg-green-500' : 'bg-transparent'}`}
          onPress={() => setActiveTab('watched')}
        >
          <Text className={`font-bold ${activeTab === 'watched' ? 'text-white' : 'text-slate-400'}`}>Watched</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : filteredList.length === 0 ? (
        <View className="flex-1 justify-center items-center opacity-50 pb-20 px-10">
          <Ionicons name={activeTab === 'to_watch' ? "bookmark-outline" : "checkmark-circle-outline"} size={80} color="#94a3b8" />
          <Text className="text-slate-400 text-lg mt-4 text-center">
            {activeTab === 'to_watch' 
              ? "Your Watchlist is empty. Go find some movies!" 
              : "You haven't marked any movies as watched yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.movieId.toString()}
          renderItem={renderMovieCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}