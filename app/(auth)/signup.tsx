import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, Link } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser, setRole } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'user', 
        createdAt: new Date().toISOString(),
      });

      setUser(auth.currentUser);
      setRole('user');

      router.replace('/(dashboard)/(tabs)' as any);
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-slate-900">
      <Text className="text-4xl font-bold text-red-500 text-center mb-2">Create Account</Text>
      <Text className="text-slate-400 text-center mb-10 text-lg">Join Watchlist today</Text>

      <TextInput
        className="bg-slate-800 text-white px-4 py-3 rounded-lg mb-4 text-base border border-slate-700"
        placeholder="Full Name"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="bg-slate-800 text-white px-4 py-3 rounded-lg mb-4 text-base border border-slate-700"
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-slate-800 text-white px-4 py-3 rounded-lg mb-4 text-base border border-slate-700"
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="bg-slate-800 text-white px-4 py-3 rounded-lg mb-6 text-base border border-slate-700"
        placeholder="Confirm Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity 
        className="bg-red-500 py-4 rounded-lg items-center mb-6"
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-slate-400 text-base">Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-red-500 font-bold text-base">Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}