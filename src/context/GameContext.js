import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../App';
import { useAuth } from './AuthContext';
import uuid from 'react-native-uuid';

const GameContext = createContext();

export const useGame = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, submitting, playing, scoring, finished
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerGuesses, setPlayerGuesses] = useState({});
  const [scores, setScores] = useState({});
  const { currentUser } = useAuth();

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async (maxPlayers = 8) => {
    try {
      const roomCode = generateRoomCode();
      const roomData = {
        code: roomCode,
        hostId: currentUser.uid,
        hostName: currentUser.displayName || currentUser.username,
        players: [{
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.username,
          isHost: true,
          hasSubmittedSong: false,
          score: 0
        }],
        maxPlayers,
        gameState: 'waiting',
        songs: [],
        currentSongIndex: 0,
        createdAt: serverTimestamp(),
        guesses: {},
        scores: {}
      };

      await setDoc(doc(db, 'rooms', roomCode), roomData);
      setCurrentRoom(roomCode);
      return roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const joinRoom = async (roomCode) => {
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data();
      
      if (roomData.players.length >= roomData.maxPlayers) {
        throw new Error('Room is full');
      }

      if (roomData.gameState !== 'waiting') {
        throw new Error('Game is already in progress');
      }

      // Check if user is already in room
      const existingPlayer = roomData.players.find(p => p.id === currentUser.uid);
      if (existingPlayer) {
        setCurrentRoom(roomCode);
        return roomCode;
      }

      const newPlayer = {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.username,
        isHost: false,
        hasSubmittedSong: false,
        score: 0
      };

      await updateDoc(roomRef, {
        players: arrayUnion(newPlayer)
      });

      setCurrentRoom(roomCode);
      return roomCode;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoom);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const updatedPlayers = roomData.players.filter(p => p.id !== currentUser.uid);

        if (updatedPlayers.length === 0) {
          // Delete room if no players left
          await deleteDoc(roomRef);
        } else {
          // If host leaves, assign new host
          if (roomData.hostId === currentUser.uid && updatedPlayers.length > 0) {
            updatedPlayers[0].isHost = true;
            await updateDoc(roomRef, {
              players: updatedPlayers,
              hostId: updatedPlayers[0].id,
              hostName: updatedPlayers[0].name
            });
          } else {
            await updateDoc(roomRef, {
              players: updatedPlayers
            });
          }
        }
      }

      setCurrentRoom(null);
      setRoomData(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const submitSong = async (songData) => {
    if (!currentRoom) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoom);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const updatedPlayers = roomData.players.map(p => 
          p.id === currentUser.uid ? { ...p, hasSubmittedSong: true } : p
        );

        const songWithId = {
          ...songData,
          id: uuid.v4(),
          submittedBy: currentUser.uid,
          submitterName: currentUser.displayName || currentUser.username
        };

        await updateDoc(roomRef, {
          players: updatedPlayers,
          songs: arrayUnion(songWithId)
        });
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      throw error;
    }
  };

  const startGame = async () => {
    if (!currentRoom) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoom);
      await updateDoc(roomRef, {
        gameState: 'playing',
        currentSongIndex: 0
      });
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  const submitGuess = async (songId, guessedPlayerId) => {
    if (!currentRoom) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoom);
      const guessKey = `${songId}_${currentUser.uid}`;
      
      await updateDoc(roomRef, {
        [`guesses.${guessKey}`]: {
          songId,
          guessedBy: currentUser.uid,
          guessedPlayer: guessedPlayerId,
          timestamp: serverTimestamp()
        }
      });
    } catch (error) {
      console.error('Error submitting guess:', error);
      throw error;
    }
  };

  const nextSong = async () => {
    if (!currentRoom || !roomData) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoom);
      const nextIndex = roomData.currentSongIndex + 1;

      if (nextIndex >= roomData.songs.length) {
        await updateDoc(roomRef, {
          gameState: 'finished'
        });
      } else {
        await updateDoc(roomRef, {
          currentSongIndex: nextIndex
        });
      }
    } catch (error) {
      console.error('Error moving to next song:', error);
      throw error;
    }
  };

  // Listen to room changes
  useEffect(() => {
    if (!currentRoom) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', currentRoom), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomData(data);
        setGameState(data.gameState);
        setCurrentSongIndex(data.currentSongIndex);
        setPlayerGuesses(data.guesses || {});
        setScores(data.scores || {});
        
        if (data.songs && data.songs[data.currentSongIndex]) {
          setCurrentSong(data.songs[data.currentSongIndex]);
        }
      }
    });

    return unsubscribe;
  }, [currentRoom]);

  const value = {
    currentRoom,
    roomData,
    gameState,
    currentSong,
    currentSongIndex,
    playerGuesses,
    scores,
    createRoom,
    joinRoom,
    leaveRoom,
    submitSong,
    startGame,
    submitGuess,
    nextSong,
    setCurrentRoom
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};