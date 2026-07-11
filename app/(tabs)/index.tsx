import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-4xl font-bold text-red-500 mb-4">Watchlist</Text>
      <Text className="text-lg text-slate-300 text-center px-4">
        Your ultimate movie list, from Denzel Washington thrillers to classic comedies!
      </Text>
    </View>
  );
}