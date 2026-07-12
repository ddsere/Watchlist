import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserWatchlist, toggleWatchlistStatus } from '../../../services/firestore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../theme';

export default function Watchlist() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'to_watch' | 'watched'>('to_watch');
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) fetchWatchlist();
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
      style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, marginBottom: 16, marginHorizontal: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}
      onPress={() => router.push({ pathname: '/(dashboard)/movie/[id]' as any, params: { id: item.movieId } })}
    >
      <Image 
        source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster' }}
        style={{ width: 96, height: 144, backgroundColor: colors.border }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }} numberOfLines={2}>{item.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{item.release_date ? item.release_date.substring(0, 4) : 'N/A'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Ionicons name="star" size={12} color="#eab308" />
              <Text style={{ color: '#eab308', fontWeight: 'bold', fontSize: 12, marginLeft: 4 }}>
                {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 12 }}>
          <TouchableOpacity 
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: activeTab === 'to_watch' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
            onPress={() => handleMove(item)}
          >
            <Ionicons name={activeTab === 'to_watch' ? "checkmark-circle" : "bookmark"} size={16} color={activeTab === 'to_watch' ? "#10b981" : "#ef4444"} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: activeTab === 'to_watch' ? '#10b981' : '#ef4444' }}>
              {activeTab === 'to_watch' ? 'Mark Watched' : 'To Watch'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.background, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => handleRemove(item)}
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 48 }}>
      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 24, marginBottom: 16, paddingHorizontal: 16 }}>My Lists</Text>
      
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, padding: 4, borderRadius: 12, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
        <TouchableOpacity 
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'to_watch' ? colors.primary : 'transparent' }}
          onPress={() => setActiveTab('to_watch')}
        >
          <Text style={{ fontWeight: 'bold', color: activeTab === 'to_watch' ? '#ffffff' : colors.textMuted }}>To Watch</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'watched' ? colors.primary : 'transparent' }}
          onPress={() => setActiveTab('watched')}
        >
          <Text style={{ fontWeight: 'bold', color: activeTab === 'watched' ? '#ffffff' : colors.textMuted }}>Watched</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5, paddingBottom: 80, paddingHorizontal: 40 }}>
          <Ionicons name={activeTab === 'to_watch' ? "bookmark-outline" : "checkmark-circle-outline"} size={80} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
            {activeTab === 'to_watch' ? "Your Watchlist is empty. Go find some movies!" : "You haven't marked any movies as watched yet."}
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