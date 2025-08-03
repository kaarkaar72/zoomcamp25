import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, username) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(result.user, {
        displayName: username
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        username: username,
        email: email,
        totalScore: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    return signOut(auth);
  };

  const getUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const updateUserScore = async (userId, score) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await setDoc(userRef, {
          ...userData,
          totalScore: userData.totalScore + score,
          gamesPlayed: userData.gamesPlayed + 1,
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating user score:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user.uid);
        setCurrentUser({ ...user, ...userData });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserData,
    updateUserScore
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};