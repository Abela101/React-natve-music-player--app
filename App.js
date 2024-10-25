import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [sound, setSound] = useState(null);
  const [likedMusic, setLikedMusic] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Function to request permissions
  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access media library is required!');
    }
  };

  // Function to browse and select a music file
  const browseFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/m4a', 'audio/mpeg', 'audio/x-m4a', 'audio/*'], // Include all audio types
        copyToCacheDirectory: false,
      });

      if (res.type === 'success') {
        playMusic(res.uri);
        setCurrentTrack(res);
      } else {
        console.log('File selection canceled or not successful');
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  // Function to play the selected music
  const playMusic = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  };

  // Function to like the current playing music
  const likeMusic = () => {
    if (currentTrack && !likedMusic.some(track => track.uri === currentTrack.uri)) {
      setLikedMusic([...likedMusic, currentTrack]);
    }
  };

  // Clean up sound when component unmounts
  useEffect(() => {
    requestPermissions(); // Request permissions on mount
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      {/* Music Image */}
      <Image source={require('./assets/music.jpg')} style={styles.image} />

      <Text style={styles.header}>Music Player App</Text>

      <Button title="Browse Music" onPress={browseFile} />

      {currentTrack && (
        <View style={styles.trackContainer}>
          <Text>Now Playing: {currentTrack.name}</Text>
          <Button title="Like" onPress={likeMusic} />
        </View>
      )}

      <View style={styles.likedContainer}>
        <Text style={styles.subheader}>Liked Music</Text>
        <FlatList
          data={likedMusic}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => playMusic(item.uri)}>
              <Text style={styles.track}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  trackContainer: {
    marginVertical: 20,
  },
  track: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  likedContainer: {
    marginTop: 20,
  },
});
