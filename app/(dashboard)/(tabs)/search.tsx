import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { searchMovies, searchMoviesByActor, getMovieGenres, discoverMoviesByGenre } from '../../../services/tmdb';

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'actor'>('title');
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    const genresData = await getMovieGenres();
    setGenres(genresData);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSelectedGenre(null);
    setHasSearched(true);

    let data = [];
    if (searchType === 'title') {
      data = await searchMovies(query);
    } else {
      data = await searchMoviesByActor(query);
    }
    
    setResults(data);
    setLoading(false);
  };

  const handleGenreSelect = async (genreId: number) => {
    setQuery(''); 
    Keyboard.dismiss();
    setSelectedGenre(genreId);
    setLoading(true);
    setHasSearched(true);
    
    const data = await discoverMoviesByGenre(genreId);
    setResults(data);
    setLoading(false);
  };

  const renderMovieItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row bg-slate-800 rounded-xl mb-4 overflow-hidden border border-slate-700"
      onPress={() => router.push({ pathname: '/(dashboard)/movie/[id]' as any, params: { id: item.id } })}
    >
      <Image 
        source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster' }}
        className="w-24 h-36 bg-slate-700"
        resizeMode="cover"
      />
      <View className="flex-1 p-4 justify-center">
        <Text className="text-white font-bold text-lg mb-1" numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <Text className="text-slate-400 text-sm mb-3">
          {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
        </Text>
        <View className="flex-row items-center bg-slate-900 self-start px-2 py-1 rounded-md">
          <Ionicons name="star" size={14} color="#eab308" />
          <Text className="text-yellow-500 font-bold text-xs ml-1">
            {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900 pt-12 px-4">
      <Text className="text-white font-bold text-2xl mb-4">Search</Text>

      <View className="flex-row bg-slate-800 rounded-lg p-1 mb-4 border border-slate-700">
        <TouchableOpacity 
          className={`flex-1 py-2 items-center rounded-md ${searchType === 'title' ? 'bg-red-500' : 'bg-transparent'}`}
          onPress={() => setSearchType('title')}
        >
          <Text className={`font-bold ${searchType === 'title' ? 'text-white' : 'text-slate-400'}`}>Title</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2 items-center rounded-md ${searchType === 'actor' ? 'bg-red-500' : 'bg-transparent'}`}
          onPress={() => setSearchType('actor')}
        >
          <Text className={`font-bold ${searchType === 'actor' ? 'text-white' : 'text-slate-400'}`}>Actor</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-slate-800 rounded-xl border border-slate-700 mb-4 px-4 h-14">
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          className="flex-1 text-white ml-3 text-base h-full"
          placeholder={`Search by ${searchType}...`}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <View className="h-12 mb-2">
        <FlatList
          data={genres}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className={`px-4 py-2 rounded-full mr-2 border ${selectedGenre === item.id ? 'bg-red-500 border-red-500' : 'bg-slate-800 border-slate-700'}`}
              onPress={() => handleGenreSelect(item.id)}
            >
              <Text className={`font-semibold ${selectedGenre === item.id ? 'text-white' : 'text-slate-300'}`}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : !hasSearched ? (
        /* 4.3 Spec: Empty state illustration */
        <View className="flex-1 justify-center items-center opacity-50 pb-20">
          <Ionicons name="film-outline" size={80} color="#94a3b8" />
          <Text className="text-slate-400 text-lg mt-4 text-center px-10">
            Search for a movie or actor to get started
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 justify-center items-center pb-20">
          <Text className="text-slate-400 text-lg">No results found.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}