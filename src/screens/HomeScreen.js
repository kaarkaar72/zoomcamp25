import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Title,
  Button,
  Card,
  Paragraph,
  Avatar,
  Headline,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={60}
                label={currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Title style={styles.username}>
                  {currentUser?.displayName || 'User'}
                </Title>
                <Paragraph style={styles.stats}>
                  Total Score: {currentUser?.totalScore || 0} • Games: {currentUser?.gamesPlayed || 0}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Game Options */}
        <View style={styles.gameSection}>
          <Headline style={styles.sectionTitle}>Start Playing</Headline>
          
          <Card style={styles.optionCard}>
            <Card.Content>
              <Title style={styles.optionTitle}>🎮 Create New Game</Title>
              <Paragraph style={styles.optionDescription}>
                Start a new room and invite friends to join your music guessing game
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateRoom')}
                style={styles.optionButton}
                contentStyle={styles.buttonContent}
              >
                Create Room
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.optionCard}>
            <Card.Content>
              <Title style={styles.optionTitle}>🚪 Join Game</Title>
              <Paragraph style={styles.optionDescription}>
                Enter a room code to join an existing game with your friends
              </Paragraph>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('JoinRoom')}
                style={styles.optionButton}
                contentStyle={styles.buttonContent}
              >
                Join Room
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* How to Play */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>🎵 How to Play</Title>
            <View style={styles.stepsList}>
              <Paragraph style={styles.step}>1. Create or join a room with friends</Paragraph>
              <Paragraph style={styles.step}>2. Each player submits one song</Paragraph>
              <Paragraph style={styles.step}>3. Listen to 20-30 second clips</Paragraph>
              <Paragraph style={styles.step}>4. Guess who submitted each song</Paragraph>
              <Paragraph style={styles.step}>5. Earn points for correct guesses!</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Button
          mode="text"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutText}
        >
          Logout
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
  profileCard: {
    marginBottom: 25,
    elevation: 2,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  stats: {
    color: theme.colors.text,
    opacity: 0.7,
  },
  gameSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionCard: {
    marginBottom: 15,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  optionDescription: {
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 15,
    lineHeight: 20,
  },
  optionButton: {
    marginTop: 5,
  },
  buttonContent: {
    paddingVertical: 5,
  },
  infoCard: {
    marginBottom: 20,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 15,
  },
  stepsList: {
    paddingLeft: 10,
  },
  step: {
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  divider: {
    marginVertical: 20,
  },
  logoutButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: theme.colors.error,
  },
});