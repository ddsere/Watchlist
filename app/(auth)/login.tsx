import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';

GoogleSignin.configure({
  webClientId: '819056028866-e83eafhdfspvojru0h81aquc0na01k2l.apps.googleusercontent.com',
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser, setRole } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userRole = 'user';
      if (userDocSnap.exists()) {
        userRole = userDocSnap.data().role || 'user';
      }

      setUser(user);
      setRole(userRole as 'admin' | 'user');

      router.replace('/(dashboard)/(tabs)' as any);
      
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;

      if (!idToken) {
        throw new Error("No ID Token found");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userRole = 'user';
      
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      } else {
        userRole = userDocSnap.data().role || 'user';
      }

      setUser(user);
      setRole(userRole as 'admin' | 'user');

      router.replace('/(dashboard)/(tabs)' as any);
      
    } catch (error: any) {
      console.error(error);
      Alert.alert("Google Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-slate-900">
      <Text className="text-4xl font-bold text-red-500 text-center mb-2">Watchlist</Text>
      <Text className="text-slate-400 text-center mb-10 text-lg">Login to your account</Text>

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
        className="bg-slate-800 text-white px-4 py-3 rounded-lg mb-6 text-base border border-slate-700"
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        className="bg-red-500 py-4 rounded-lg items-center mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-lg">Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-white py-4 rounded-lg items-center mb-8 flex-row justify-center border border-slate-300"
        onPress={handleGoogleLogin}
        disabled={loading}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Image 
          source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
          style={{ width: 24, height: 24, marginRight: 12 }} 
          resizeMode="contain"
        />
        <Text className="text-slate-900 font-bold text-lg">Sign in with Google</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-slate-400 text-base">Don't have an account? </Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text className="text-red-500 font-bold text-base">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}