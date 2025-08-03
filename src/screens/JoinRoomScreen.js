import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useGame } from '../context/GameContext';
import { theme } from '../theme/theme';

export default function JoinRoomScreen({ navigation }) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { joinRoom } = useGame();

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      await joinRoom(roomCode.toUpperCase().trim());
      navigation.navigate('GameRoom');
    } catch (error) {
      let errorMessage = 'Failed to join room. Please try again.';
      
      if (error.message === 'Room not found') {
        errorMessage = 'Room not found. Please check the room code.';
      } else if (error.message === 'Room is full') {
        errorMessage = 'This room is full. Try joining a different room.';
      } else if (error.message === 'Game is already in progress') {
        errorMessage = 'This game has already started. Try joining a different room.';
      }
      
      Alert.alert('Unable to Join', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatRoomCode = (text) => {
    // Convert to uppercase and limit to 6 characters
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setRoomCode(formatted);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Title style={styles.loadingText}>Joining room...</Title>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>🚪 Join Game Room</Title>
          <Paragraph style={styles.subtitle}>
            Enter the room code shared by your friend
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Room Code"
              value={roomCode}
              onChangeText={formatRoomCode}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. ABC123"
              autoCapitalize="characters"
              maxLength={6}
              textAlign="center"
              contentStyle={styles.inputContent}
            />
            
            <Paragraph style={styles.codeHelp}>
              Room codes are 6 characters long (letters and numbers)
            </Paragraph>

            <Button
              mode="contained"
              onPress={handleJoinRoom}
              style={styles.joinButton}
              contentStyle={styles.buttonContent}
              disabled={loading || roomCode.length < 6}
            >
              Join Room
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Need a Room Code?</Title>
            <Paragraph style={styles.infoText}>
              Ask the person who created the game to share their room code with you. 
              Room codes are generated automatically when someone creates a new game.
            </Paragraph>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CreateRoom')}
              style={styles.createButton}
              contentStyle={styles.buttonContent}
            >
              Create Your Own Room
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 20,
    color: theme.colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 30,
    elevation: 2,
  },
  cardContent: {
    padding: 30,
  },
  input: {
    marginBottom: 10,
    fontSize: 20,
  },
  inputContent: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  codeHelp: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 25,
  },
  joinButton: {
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 15,
  },
  infoText: {
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  createButton: {
    marginTop: 10,
  },
});