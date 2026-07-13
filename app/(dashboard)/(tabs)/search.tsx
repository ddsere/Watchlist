import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  discoverMoviesByGenre,
  getMovieGenres,
  searchMovies,
  searchMoviesByActor,
} from "../../../services/tmdb";
import { useTheme } from "../../../theme";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "actor">("title");
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { colors } = useTheme();

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
    let data =
      searchType === "title"
        ? await searchMovies(query)
        : await searchMoviesByActor(query);
    setResults(data);
    setLoading(false);
  };

  const handleGenreSelect = async (genreId: number) => {
    setQuery("");
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
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
      onPress={() =>
        router.push({
          pathname: "/(dashboard)/movie/[id]" as any,
          params: { id: item.id },
        })
      }
    >
      <Image
        source={{
          uri: item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : "https://via.placeholder.com/200x300?text=No+Poster",
        }}
        style={{ width: 96, height: 144, backgroundColor: colors.border }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            color: colors.text,
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.title || item.name}
        </Text>
        <Text
          style={{ color: colors.textMuted, fontSize: 14, marginBottom: 12 }}
        >
          {item.release_date ? item.release_date.substring(0, 4) : "N/A"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background,
            alignSelf: "flex-start",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Ionicons name="star" size={14} color="#eab308" />
          <Text
            style={{
              color: "#eab308",
              fontWeight: "bold",
              fontSize: 12,
              marginLeft: 4,
            }}
          >
            {item.vote_average ? item.vote_average.toFixed(1) : "NR"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 60,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontWeight: "bold",
          fontSize: 24,
          marginBottom: 16,
        }}
      >
        Search
      </Text>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 4,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: "center",
            borderRadius: 6,
            backgroundColor:
              searchType === "title" ? colors.primary : "transparent",
          }}
          onPress={() => setSearchType("title")}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: searchType === "title" ? "#ffffff" : colors.textMuted,
            }}
          >
            Title
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: "center",
            borderRadius: 6,
            backgroundColor:
              searchType === "actor" ? colors.primary : "transparent",
          }}
          onPress={() => setSearchType("actor")}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: searchType === "actor" ? "#ffffff" : colors.textMuted,
            }}
          >
            Actor
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          paddingHorizontal: 16,
          height: 56,
        }}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={{
            flex: 1,
            color: colors.text,
            marginLeft: 12,
            fontSize: 16,
            height: "100%",
          }}
          placeholder={`Search by ${searchType}...`}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 48, marginBottom: 8 }}>
        <FlatList
          data={genres}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                height: 36, // paddingVertical වෙනුවට නිශ්චිත උසක් ලබා දීම
                justifyContent: "center", // සිරස් අතට (Vertically) මැදට ගැනීම
                alignItems: "center", // තිරස් අතට (Horizontally) මැදට ගැනීම
                borderRadius: 18, // Height එකෙන් භාගයක් (36 / 2)
                marginRight: 8,
                borderWidth: 1,
                backgroundColor:
                  selectedGenre === item.id ? colors.primary : colors.surface,
                borderColor:
                  selectedGenre === item.id ? colors.primary : colors.border,
              }}
              onPress={() => handleGenreSelect(item.id)}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: selectedGenre === item.id ? "#ffffff" : colors.text,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !hasSearched ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.5,
            paddingBottom: 80,
          }}
        >
          <Ionicons name="film-outline" size={80} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 18,
              marginTop: 16,
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            Search for a movie or actor to get started
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 80,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 18 }}>
            No results found.
          </Text>
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
