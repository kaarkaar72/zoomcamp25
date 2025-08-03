import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
  Paragraph,
  RadioButton,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useGame } from '../context/GameContext';
import { theme } from '../theme/theme';

export default function CreateRoomScreen({ navigation }) {
  const [maxPlayers, setMaxPlayers] = useState('6');
  const [loading, setLoading] = useState(false);
  const { createRoom } = useGame();

  const playerOptions = [
    { label: '4 Players', value: '4' },
    { label: '6 Players', value: '6' },
    { label: '8 Players', value: '8' },
    { label: '10 Players', value: '10' },
  ];

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const roomCode = await createRoom(parseInt(maxPlayers));
      Alert.alert(
        'Room Created!',
        `Your room code is: ${roomCode}\nShare this with your friends to let them join.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('GameRoom'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Title style={styles.loadingText}>Creating your room...</Title>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>🎮 Create New Game</Title>
          <Paragraph style={styles.subtitle}>
            Set up your music guessing game room
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Room Settings</Text>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Maximum Players</Text>
              <Paragraph style={styles.settingDescription}>
                Choose how many friends can join your game
              </Paragraph>
              
              <RadioButton.Group
                onValueChange={setMaxPlayers}
                value={maxPlayers}
              >
                {playerOptions.map((option) => (
                  <View key={option.value} style={styles.radioOption}>
                    <RadioButton.Item
                      label={option.label}
                      value={option.value}
                      labelStyle={styles.radioLabel}
                    />
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Game Rules</Text>
            <View style={styles.rulesList}>
              <Paragraph style={styles.rule}>
                • Each player submits one song (YouTube or Spotify link)
              </Paragraph>
              <Paragraph style={styles.rule}>
                • Listen to 20-30 second clips from each song
              </Paragraph>
              <Paragraph style={styles.rule}>
                • Guess which player submitted each song
              </Paragraph>
              <Paragraph style={styles.rule}>
                • Earn points for correct guesses
              </Paragraph>
              <Paragraph style={styles.rule}>
                • See final leaderboard at the end
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleCreateRoom}
          style={styles.createButton}
          contentStyle={styles.buttonContent}
          disabled={loading}
        >
          Create Room
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
    elevation: 2,
  },
  cardContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
  },
  settingSection: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 15,
  },
  radioOption: {
    marginVertical: 2,
  },
  radioLabel: {
    fontSize: 16,
  },
  infoCard: {
    marginBottom: 30,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
  },
  rulesList: {
    paddingLeft: 10,
  },
  rule: {
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  createButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});