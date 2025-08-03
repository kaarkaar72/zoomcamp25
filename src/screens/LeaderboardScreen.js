import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Button,
  Card,
  Paragraph,
  Avatar,
  Text,
  Chip,
  Divider,
} from 'react-native-paper';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function LeaderboardScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const { roomData, playerGuesses, leaveRoom } = useGame();
  const { currentUser, updateUserScore } = useAuth();

  useEffect(() => {
    calculateScores();
  }, [roomData, playerGuesses]);

  const calculateScores = () => {
    if (!roomData || !playerGuesses) return;

    const playerScores = {};
    
    // Initialize scores for all players
    roomData.players.forEach(player => {
      playerScores[player.id] = {
        id: player.id,
        name: player.name,
        score: 0,
        correctGuesses: 0,
        totalGuesses: 0
      };
    });

    // Calculate scores based on correct guesses
    Object.values(playerGuesses).forEach(guess => {
      const guesser = playerScores[guess.guessedBy];
      if (guesser) {
        guesser.totalGuesses++;
        
        // Find the song to check if guess is correct
        const song = roomData.songs.find(s => s.id === guess.songId);
        if (song && song.submittedBy === guess.guessedPlayer) {
          guesser.correctGuesses++;
          guesser.score += 10; // 10 points per correct guess
        }
      }
    });

    // Convert to array and sort by score
    const sortedScores = Object.values(playerScores)
      .sort((a, b) => b.score - a.score);

    setScores(sortedScores);

    // Update user's total score in Firebase
    const currentUserScore = playerScores[currentUser.uid];
    if (currentUserScore) {
      updateUserScore(currentUser.uid, currentUserScore.score);
    }
  };

  const handlePlayAgain = () => {
    Alert.alert(
      'Play Again?',
      'Do you want to create a new room with the same players?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Room',
          onPress: () => {
            leaveRoom();
            navigation.navigate('CreateRoom');
          },
        },
      ]
    );
  };

  const handleBackToHome = async () => {
    await leaveRoom();
    navigation.navigate('Home');
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return theme.colors.text;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Title style={styles.title}>🎉 Final Scores!</Title>
            <Paragraph style={styles.subtitle}>
              Game completed • {roomData?.songs?.length || 0} songs played
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Leaderboard */}
        <Card style={styles.leaderboardCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Leaderboard</Title>
            
            {scores.map((player, index) => (
              <View key={player.id}>
                <View style={styles.playerRow}>
                  <View style={styles.rankSection}>
                    <Text style={[styles.rank, { color: getRankColor(index) }]}>
                      {getRankEmoji(index)}
                    </Text>
                  </View>

                  <Avatar.Text
                    size={50}
                    label={player.name[0].toUpperCase()}
                    style={[
                      styles.playerAvatar,
                      index === 0 && styles.winnerAvatar
                    ]}
                  />

                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      player.id === currentUser.uid && styles.currentUserName
                    ]}>
                      {player.name}
                      {player.id === currentUser.uid && ' (You)'}
                    </Text>
                    <Text style={styles.playerStats}>
                      {player.correctGuesses}/{player.totalGuesses} correct
                    </Text>
                  </View>

                  <View style={styles.scoreSection}>
                    <Text style={[
                      styles.score,
                      index === 0 && styles.winnerScore
                    ]}>
                      {player.score}
                    </Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                  </View>
                </View>

                {index < scores.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Winner Celebration */}
        {scores.length > 0 && (
          <Card style={styles.winnerCard}>
            <Card.Content style={styles.winnerContent}>
              <Title style={styles.winnerTitle}>
                🎊 Congratulations! 🎊
              </Title>
              <Paragraph style={styles.winnerText}>
                {scores[0].id === currentUser.uid 
                  ? "You won the game!" 
                  : `${scores[0].name} wins the game!`
                }
              </Paragraph>
              <Chip 
                style={styles.winnerChip}
                textStyle={styles.winnerChipText}
              >
                {scores[0].score} points • {scores[0].correctGuesses} correct guesses
              </Chip>
            </Card.Content>
          </Card>
        )}

        {/* Game Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Game Summary</Title>
            <View style={styles.statsList}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Songs:</Text>
                <Text style={styles.statValue}>{roomData?.songs?.length || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Players:</Text>
                <Text style={styles.statValue}>{roomData?.players?.length || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Score:</Text>
                <Text style={styles.statValue}>
                  {scores.find(s => s.id === currentUser.uid)?.score || 0} points
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handlePlayAgain}
            style={styles.playAgainButton}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            Play Again
          </Button>

          <Button
            mode="outlined"
            onPress={handleBackToHome}
            style={styles.homeButton}
            contentStyle={styles.buttonContent}
            icon="home"
          >
            Back to Home
          </Button>
        </View>
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
  headerCard: {
    marginBottom: 20,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
  },
  leaderboardCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerAvatar: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 15,
  },
  winnerAvatar: {
    backgroundColor: '#FFD700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentUserName: {
    color: theme.colors.primary,
  },
  playerStats: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  scoreSection: {
    alignItems: 'center',
    minWidth: 60,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  winnerScore: {
    color: '#FFD700',
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.6,
  },
  divider: {
    marginVertical: 5,
  },
  winnerCard: {
    marginBottom: 20,
    elevation: 1,
    backgroundColor: '#FFF9E6',
  },
  winnerContent: {
    alignItems: 'center',
    padding: 25,
  },
  winnerTitle: {
    fontSize: 22,
    color: '#FF6B35',
    marginBottom: 10,
  },
  winnerText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  winnerChip: {
    backgroundColor: '#FFD700',
  },
  winnerChipText: {
    color: '#000',
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: 30,
    elevation: 1,
  },
  statsList: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  statValue: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  actions: {
    gap: 15,
    marginBottom: 20,
  },
  playAgainButton: {
    backgroundColor: theme.colors.success,
  },
  homeButton: {
    borderColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});