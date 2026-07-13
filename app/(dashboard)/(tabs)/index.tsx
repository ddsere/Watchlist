import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getPopularMovies,
  getRecommendations,
  getTopRatedMovies,
} from "../../../services/tmdb";
import { useAuthStore } from "../../../store/useAuthStore";
import { useTheme } from "../../../theme";

import { useFonts, Jersey25_400Regular } from '@expo-google-fonts/jersey-25';

export default function Home() {
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { colors } = useTheme();

  const [fontsLoaded] = useFonts({
    Jersey25_400Regular,
  });

  useEffect(() => {
    fetchAllMovies();
  }, []);

  const fetchAllMovies = async () => {
    setLoading(true);
    const [popularData, topRatedData, recommendedData] = await Promise.all([
      getPopularMovies(),
      getTopRatedMovies(),
      getRecommendations(),
    ]);

    setPopular(popularData);
    setTopRated(topRatedData);
    setRecommended(recommendedData);
    setLoading(false);
  };

  const renderMovieCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        width: 144,
        marginRight: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() =>
        router.push({
          pathname: "/(dashboard)/movie/[id]" as any,
          params: { id: item.id },
        })
      }
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
        style={{ width: "100%", height: 208, backgroundColor: colors.border }}
        resizeMode="cover"
      />
      <View style={{ padding: 8 }}>
        <Text
          style={{ color: colors.text, fontWeight: "bold", fontSize: 14 }}
          numberOfLines={1}
        >
          {item.title || item.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {item.release_date ? item.release_date.substring(0, 4) : ""}
          </Text>
          <Text style={{ color: "#eab308", fontWeight: "bold", fontSize: 12 }}>
            ★ {item.vote_average ? item.vote_average.toFixed(1) : "NR"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MovieCarousel = ({ title, data }: { title: string; data: any[] }) => (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 20 }}>
          {title}
        </Text>
        <TouchableOpacity>
          <Text
            style={{ color: colors.primary, fontSize: 14, fontWeight: "bold" }}
          >
            See All
          </Text>
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

  if (loading || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 28,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "Jersey25_400Regular",
          }}
        >
          <Text style={{ color: colors.text }}>WATCH</Text>
          <Text style={{ color: colors.primary }}>LIST</Text>
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(dashboard)/(tabs)/profile" as any)}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          ) : (
            <View
              style={{
                width: 32,
                height: 32,
                backgroundColor: colors.primary,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                {user?.displayName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchAllMovies}
            tintColor={colors.primary}
          />
        }
      >
        <MovieCarousel title="Popular Movies" data={popular} />
        <MovieCarousel title="Top Rated" data={topRated} />
        <MovieCarousel title="Recommended For You" data={recommended} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}