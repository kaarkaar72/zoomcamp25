import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import {
  Title,
  Button,
  Card,
  Paragraph,
  Avatar,
  Chip,
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function GameRoomScreen({ navigation }) {
  const [songUrl, setSongUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { 
    currentRoom, 
    roomData, 
    gameState, 
    submitSong, 
    startGame, 
    leaveRoom 
  } = useGame();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (gameState === 'playing') {
      navigation.navigate('Gameplay');
    }
  }, [gameState, navigation]);

  const handleSubmitSong = async () => {
    if (!songUrl.trim() || !songTitle.trim()) {
      Alert.alert('Error', 'Please enter both song title and URL');
      return;
    }

    // Basic URL validation
    if (!songUrl.includes('youtube.com') && !songUrl.includes('youtu.be') && 
        !songUrl.includes('spotify.com') && !songUrl.includes('open.spotify.com')) {
      Alert.alert('Error', 'Please enter a valid YouTube or Spotify URL');
      return;
    }

    setSubmitting(true);
    try {
      await submitSong({
        title: songTitle.trim(),
        url: songUrl.trim(),
      });
      setSongTitle('');
      setSongUrl('');
      Alert.alert('Success', 'Song submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit song. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomData?.players?.every(p => p.hasSubmittedSong)) {
      Alert.alert(
        'Cannot Start Game',
        'All players must submit a song before starting the game.'
      );
      return;
    }

    try {
      await startGame();
    } catch (error) {
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await leaveRoom();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const shareRoomCode = async () => {
    try {
      await Share.share({
        message: `Join my music guessing game! Room code: ${currentRoom}`,
        title: 'Music Guessing Game',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyRoomCode = async () => {
    await Clipboard.setStringAsync(currentRoom);
    Alert.alert('Copied!', 'Room code copied to clipboard');
  };

  if (!roomData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Title style={styles.loadingText}>Loading room...</Title>
      </View>
    );
  }

  const isHost = roomData.hostId === currentUser.uid;
  const currentPlayer = roomData.players?.find(p => p.id === currentUser.uid);
  const hasSubmittedSong = currentPlayer?.hasSubmittedSong || false;
  const allPlayersReady = roomData.players?.every(p => p.hasSubmittedSong) || false;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Room Info */}
        <Card style={styles.roomCard}>
          <Card.Content>
            <View style={styles.roomHeader}>
              <Title style={styles.roomTitle}>Room: {currentRoom}</Title>
              <View style={styles.roomActions}>
                <IconButton
                  icon="content-copy"
                  onPress={copyRoomCode}
                  size={20}
                />
                <IconButton
                  icon="share"
                  onPress={shareRoomCode}
                  size={20}
                />
              </View>
            </View>
            <Paragraph style={styles.hostInfo}>
              Host: {roomData.hostName}
            </Paragraph>
            <Paragraph style={styles.playersCount}>
              {roomData.players?.length || 0} / {roomData.maxPlayers} players
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Players List */}
        <Card style={styles.playersCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Players</Title>
            <View style={styles.playersList}>
              {roomData.players?.map((player) => (
                <View key={player.id} style={styles.playerItem}>
                  <Avatar.Text
                    size={40}
                    label={player.name[0].toUpperCase()}
                    style={[
                      styles.playerAvatar,
                      player.isHost && styles.hostAvatar
                    ]}
                  />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.name}
                      {player.isHost && ' (Host)'}
                    </Text>
                    <Chip
                      style={[
                        styles.statusChip,
                        player.hasSubmittedSong ? styles.readyChip : styles.waitingChip
                      ]}
                      textStyle={styles.chipText}
                    >
                      {player.hasSubmittedSong ? '✓ Ready' : 'Waiting...'}
                    </Chip>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Song Submission */}
        {!hasSubmittedSong && (
          <Card style={styles.submissionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Submit Your Song</Title>
              <Paragraph style={styles.submissionHelp}>
                Share a song you love! Others will guess that you submitted it.
              </Paragraph>

              <TextInput
                label="Song Title"
                value={songTitle}
                onChangeText={setSongTitle}
                mode="outlined"
                style={styles.input}
                placeholder="e.g. Bohemian Rhapsody"
              />

              <TextInput
                label="YouTube or Spotify URL"
                value={songUrl}
                onChangeText={setSongUrl}
                mode="outlined"
                style={styles.input}
                placeholder="https://youtube.com/watch?v=..."
                autoCapitalize="none"
              />

              <Button
                mode="contained"
                onPress={handleSubmitSong}
                loading={submitting}
                disabled={submitting}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
              >
                Submit Song
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Waiting for Others */}
        {hasSubmittedSong && !allPlayersReady && (
          <Card style={styles.waitingCard}>
            <Card.Content style={styles.waitingContent}>
              <Title style={styles.waitingTitle}>🎵 Song Submitted!</Title>
              <Paragraph style={styles.waitingText}>
                Waiting for other players to submit their songs...
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Game Controls */}
        {isHost && allPlayersReady && (
          <Card style={styles.controlsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>🎮 Ready to Start!</Title>
              <Paragraph style={styles.startHelp}>
                All players have submitted their songs. Start the game when everyone is ready!
              </Paragraph>
              <Button
                mode="contained"
                onPress={handleStartGame}
                style={styles.startButton}
                contentStyle={styles.buttonContent}
              >
                Start Game
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Leave Room */}
        <Button
          mode="outlined"
          onPress={handleLeaveRoom}
          style={styles.leaveButton}
          labelStyle={styles.leaveButtonText}
        >
          Leave Room
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
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
  roomCard: {
    marginBottom: 20,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  roomActions: {
    flexDirection: 'row',
  },
  hostInfo: {
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 5,
  },
  playersCount: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  playersCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 15,
  },
  playersList: {
    gap: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  hostAvatar: {
    backgroundColor: theme.colors.accent,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  statusChip: {
    borderRadius: 16,
  },
  readyChip: {
    backgroundColor: theme.colors.success,
  },
  waitingChip: {
    backgroundColor: theme.colors.warning,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  submissionCard: {
    marginBottom: 20,
    elevation: 2,
  },
  submissionHelp: {
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  waitingCard: {
    marginBottom: 20,
    elevation: 1,
  },
  waitingContent: {
    alignItems: 'center',
    padding: 20,
  },
  waitingTitle: {
    fontSize: 20,
    color: theme.colors.success,
    marginBottom: 10,
  },
  waitingText: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.8,
  },
  controlsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  startHelp: {
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: theme.colors.success,
  },
  leaveButton: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: theme.colors.error,
  },
  leaveButtonText: {
    color: theme.colors.error,
  },
});