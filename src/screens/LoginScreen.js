import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Card,
  Headline,
  Text,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, username);
      } else {
        await login(email, password);
      }
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Headline style={styles.title}>🎵 Music Guessing Game</Headline>
          <Paragraph style={styles.subtitle}>
            Play with friends and guess their favorite songs!
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.formTitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Title>

            {isSignUp && (
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
              />
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchButton}
            >
              {isSignUp
                ? 'Already have an account? Log In'
                : "Don't have an account? Sign Up"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    elevation: 4,
    borderRadius: theme.roundness,
  },
  cardContent: {
    padding: 30,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  buttonContent: {
    paddingVertical: 5,
  },
  switchButton: {
    marginTop: 10,
  },
});