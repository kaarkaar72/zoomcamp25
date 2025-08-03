import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Title,
  Button,
  Card,
  Paragraph,
  Avatar,
  Text,
  RadioButton,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import { Audio } from 'expo-av';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function GameplayScreen({ navigation }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  
  const { 
    roomData, 
    currentSong, 
    currentSongIndex, 
    playerGuesses,
    submitGuess, 
    nextSong,
    gameState 
  } = useGame();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (gameState === 'finished') {
      navigation.navigate('Leaderboard');
    }
  }, [gameState, navigation]);

  useEffect(() => {
    // Check if current user has already guessed for this song
    if (currentSong && currentUser) {
      const guessKey = `${currentSong.id}_${currentUser.uid}`;
      const userGuess = playerGuesses[guessKey];
      setHasGuessed(!!userGuess);
      setGuessSubmitted(!!userGuess);
      if (userGuess) {
        setSelectedPlayer(userGuess.guessedPlayer);
      }
    }
  }, [currentSong, currentUser, playerGuesses]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAndPlaySound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // For demo purposes, we'll use a placeholder URL
      // In a real app, you'd extract audio from YouTube/Spotify URLs
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }, // Placeholder
        { shouldPlay: true, isLooping: false }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status);
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading sound:', error);
      Alert.alert('Error', 'Failed to load song. Please try again.');
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (!selectedPlayer) {
      Alert.alert('Error', 'Please select a player before submitting your guess');
      return;
    }

    try {
      await submitGuess(currentSong.id, selectedPlayer);
      setGuessSubmitted(true);
      setHasGuessed(true);
      Alert.alert('Success', 'Guess submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit guess. Please try again.');
    }
  };

  const handleNextSong = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
    
    setSelectedPlayer('');
    setHasGuessed(false);
    setGuessSubmitted(false);
    setIsPlaying(false);
    setPlaybackStatus(null);
    
    await nextSong();
  };

  if (!currentSong || !roomData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Title style={styles.loadingText}>Loading next song...</Title>
      </View>
    );
  }

  const isHost = roomData.hostId === currentUser.uid;
  const progress = (currentSongIndex + 1) / roomData.songs.length;
  const otherPlayers = roomData.players.filter(p => p.id !== currentUser.uid);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Song {currentSongIndex + 1} of {roomData.songs.length}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Current Song */}
        <Card style={styles.songCard}>
          <Card.Content style={styles.songContent}>
            <Title style={styles.songTitle}>🎵 {currentSong.title}</Title>
            <Paragraph style={styles.songQuestion}>
              Who do you think submitted this song?
            </Paragraph>

            <View style={styles.audioControls}>
              {!isPlaying ? (
                <Button
                  mode="contained"
                  onPress={loadAndPlaySound}
                  style={styles.playButton}
                  contentStyle={styles.buttonContent}
                  icon="play"
                >
                  Play Song (20s)
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={stopSound}
                  style={styles.stopButton}
                  contentStyle={styles.buttonContent}
                  icon="stop"
                >
                  Stop
                </Button>
              )}
            </View>

            {playbackStatus && isPlaying && (
              <View style={styles.playbackInfo}>
                <Text style={styles.playbackText}>
                  Playing... {Math.round((playbackStatus.positionMillis || 0) / 1000)}s
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Player Selection */}
        {!hasGuessed && (
          <Card style={styles.guessCard}>
            <Card.Content>
              <Title style={styles.guessTitle}>Make Your Guess</Title>
              <RadioButton.Group
                onValueChange={setSelectedPlayer}
                value={selectedPlayer}
              >
                {otherPlayers.map((player) => (
                  <View key={player.id} style={styles.playerOption}>
                    <View style={styles.playerOptionContent}>
                      <Avatar.Text
                        size={40}
                        label={player.name[0].toUpperCase()}
                        style={styles.playerAvatar}
                      />
                      <Text style={styles.playerName}>{player.name}</Text>
                    </View>
                    <RadioButton value={player.id} />
                  </View>
                ))}
              </RadioButton.Group>

              <Button
                mode="contained"
                onPress={handleSubmitGuess}
                disabled={!selectedPlayer || guessSubmitted}
                style={styles.submitGuessButton}
                contentStyle={styles.buttonContent}
              >
                {guessSubmitted ? 'Guess Submitted' : 'Submit Guess'}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Waiting for Others */}
        {hasGuessed && (
          <Card style={styles.waitingCard}>
            <Card.Content style={styles.waitingContent}>
              <Title style={styles.waitingTitle}>✓ Guess Submitted!</Title>
              <Paragraph style={styles.waitingText}>
                Waiting for other players to make their guesses...
              </Paragraph>
              
              <View style={styles.revealSection}>
                <Text style={styles.revealText}>
                  This song was submitted by: {currentSong.submitterName}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Next Song (Host Only) */}
        {isHost && (
          <Card style={styles.controlsCard}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={handleNextSong}
                style={styles.nextButton}
                contentStyle={styles.buttonContent}
                icon="skip-next"
              >
                {currentSongIndex + 1 >= roomData.songs.length ? 'Finish Game' : 'Next Song'}
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    </View>
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
  progressCard: {
    marginBottom: 20,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  songCard: {
    marginBottom: 20,
    elevation: 2,
  },
  songContent: {
    alignItems: 'center',
    padding: 25,
  },
  songTitle: {
    fontSize: 22,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  songQuestion: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.8,
  },
  audioControls: {
    marginBottom: 20,
  },
  playButton: {
    minWidth: 160,
  },
  stopButton: {
    minWidth: 160,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  playbackInfo: {
    alignItems: 'center',
  },
  playbackText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  guessCard: {
    marginBottom: 20,
    elevation: 2,
  },
  guessTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 20,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  playerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 15,
  },
  playerName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  submitGuessButton: {
    marginTop: 20,
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
    marginBottom: 15,
  },
  waitingText: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 20,
  },
  revealSection: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: theme.roundness,
    marginTop: 10,
  },
  revealText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controlsCard: {
    elevation: 2,
  },
  nextButton: {
    backgroundColor: theme.colors.accent,
  },
});