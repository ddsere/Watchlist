import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMovieDetails, getMovieCredits } from '../../../services/tmdb';
import { getOmdbRatings } from '../../../services/omdb';

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [omdbData, setOmdbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      const [castData, omdbRatings] = await Promise.all([
        getMovieCredits(movieId),
        detailsData.imdb_id ? getOmdbRatings(detailsData.imdb_id) : Promise.resolve(null)
      ]);
      setCast(castData);
      setOmdbData(omdbRatings);
    }
    
    setLoading(false);
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
    <ScrollView className="flex-1 bg-slate-900" showsVerticalScrollIndicator={false}>
      
      <View className="relative mb-16">
        <TouchableOpacity 
          className="absolute top-12 left-4 z-10 bg-black/50 p-2 rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Image 
          source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }}
          className="w-full h-64 bg-slate-800"
          resizeMode="cover"
        />
        
        <View className="absolute w-full h-64 bg-slate-900/40" />

        <View className="absolute -bottom-12 left-4 flex-row items-end">
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }}
            className="w-32 h-48 rounded-xl border-2 border-slate-900 bg-slate-700"
            resizeMode="cover"
          />
          
          <View className="ml-4 flex-1 pb-2">
            <Text className="text-white font-bold text-2xl" numberOfLines={2}>
              {movie.title}
            </Text>
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
          <TouchableOpacity className="flex-1 bg-slate-800 p-3 rounded-xl mr-2 items-center border border-slate-700">
            <Ionicons name="add" size={20} color="#ef4444" />
            <Text className="text-white text-xs font-bold mt-1">Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-slate-800 p-3 rounded-xl mr-2 items-center border border-slate-700">
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text className="text-white text-xs font-bold mt-1">Watched</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-500 p-3 rounded-xl items-center">
            <Ionicons name="pencil" size={20} color="white" />
            <Text className="text-white text-xs font-bold mt-1">Review</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-lg font-bold mb-2">Overview</Text>
        <Text className="text-slate-400 text-sm leading-6 mb-6">
          {movie.overview}
        </Text>

        <Text className="text-white text-lg font-bold mb-3">Cast</Text>
        <FlatList
          data={cast.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="w-20 mr-4 items-center">
              <Image 
                source={{ uri: item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : 'https://via.placeholder.com/150' }}
                className="w-16 h-16 rounded-full bg-slate-700 mb-2"
                resizeMode="cover"
              />
              <Text className="text-white text-xs text-center font-semibold" numberOfLines={2}>{item.name}</Text>
              <Text className="text-slate-500 text-[10px] text-center mt-1" numberOfLines={2}>{item.character}</Text>
            </View>
          )}
          className="mb-8"
        />
      </View>
      
      <View className="h-10" />
    </ScrollView>
  );
}