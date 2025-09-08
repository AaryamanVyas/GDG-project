import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppProvider';

export default function DecksScreen() {
  const { state, addDeck } = useApp();
  const [name, setName] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FlashMaster</Text>
      <Text style={styles.coins}>Coins: {state.coins}</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="New deck name"
          placeholderTextColor="#7a8aa0"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (!name.trim()) return;
            addDeck(name.trim());
            setName('');
          }}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.decks}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deck} onPress={() => router.push(`/deck/${item.id}`)}>
            <Text style={styles.deckTitle}>{item.name}</Text>
            <Text style={styles.deckMeta}>{item.cards.length} cards</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Create your first deck!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 16 },
  header: { color: 'white', fontSize: 24, fontWeight: '700' },
  coins: { color: '#9fb7d1', marginTop: 6, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#1a2430', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#243345' },
  addBtn: { backgroundColor: '#4f8cff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: '700' },
  list: { paddingBottom: 40 },
  deck: { backgroundColor: '#121922', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#223244' },
  deckTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  deckMeta: { color: '#9fb7d1', marginTop: 4 },
  empty: { color: '#6c8199', marginTop: 20 }
});


