import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { getPopularMovies, getTopRatedMovies, getRecommendations } from '../../../services/tmdb';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAllMovies();
  }, []);

  const fetchAllMovies = async () => {
    setLoading(true);
    const [popularData, topRatedData, recommendedData] = await Promise.all([
      getPopularMovies(),
      getTopRatedMovies(),
      getRecommendations()
    ]);
    
    setPopular(popularData);
    setTopRated(topRatedData);
    setRecommended(recommendedData);
    setLoading(false);
  };

  const renderMovieCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="w-36 mr-4 bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
      onPress={() => console.log("Navigate to movie:", item.id)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
        className="w-full h-52 bg-slate-700"
        resizeMode="cover"
      />
      <View className="p-2">
        <Text className="text-white font-bold text-sm" numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-slate-400 text-xs">
            {item.release_date ? item.release_date.substring(0, 4) : ''}
          </Text>
          <Text className="text-yellow-500 font-bold text-xs">
            ★ {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MovieCarousel = ({ title, data }: { title: string, data: any[] }) => (
    <View className="mb-6">
      <View className="flex-row justify-between items-end px-4 mb-3">
        <Text className="text-white font-bold text-xl">{title}</Text>
        <TouchableOpacity>
          <Text className="text-red-500 text-sm font-bold">See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieCard}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
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
      <View className="flex-row justify-between items-center px-4 pt-12 pb-4 bg-slate-900">
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
        
        <Text className="text-red-500 font-bold text-xl">Watchlist</Text>
        
        <TouchableOpacity onPress={() => router.push('/(dashboard)/(tabs)/profile')}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} className="w-8 h-8 rounded-full border border-slate-600" />
          ) : (
            <View className="w-8 h-8 bg-red-500 rounded-full justify-center items-center">
              <Text className="text-white font-bold">{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAllMovies} tintColor="#ef4444" />}
      >
        <MovieCarousel title="Popular Movies" data={popular} />
        <MovieCarousel title="Top Rated" data={topRated} />
        <MovieCarousel title="Recommended For You" data={recommended} />
        <View className="h-10" /> 
      </ScrollView>
    </View>
  );
}