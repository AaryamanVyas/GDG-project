import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppProvider';

export default function DeckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addCard, deleteCard, deleteDeck } = useApp();
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const router = useRouter();

  const deck = useMemo(() => state.decks.find((d) => d.id === id), [state.decks, id]);
  if (!deck) return <View style={styles.container}><Text style={styles.header}>Deck not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{deck.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeBtn}>
            <Text style={styles.btnText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteDeckTop} onPress={() => { deleteDeck(deck.id); router.replace('/'); }}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.meta}>{deck.cards.length} cards</Text>

      <View style={styles.form}>
        <TextInput placeholder="Question" placeholderTextColor="#7a8aa0" value={q} onChangeText={setQ} style={styles.input} />
        <TextInput placeholder="Answer" placeholderTextColor="#7a8aa0" value={a} onChangeText={setA} style={styles.input} />
        <TouchableOpacity
          style={styles.primary}
          onPress={() => {
            if (!q.trim() || !a.trim()) return;
            addCard(deck.id, q.trim(), a.trim());
            setQ(''); setA('');
          }}>
          <Text style={styles.btnText}>Add Card</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deck.cards}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <View style={styles.cardCol}>
              <Text style={styles.q}>{item.question}</Text>
              <Text style={styles.a}>{item.answer}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteCard(deck.id, item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>No cards yet.</Text>}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push({ pathname: '/deck/[id]/test', params: { id: deck.id } })}>
          <Text style={styles.startText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 8 },
  header: { color: 'white', fontSize: 22, fontWeight: '700' },
  homeBtn: { backgroundColor: '#2a3647', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  meta: { color: '#9fb7d1', marginBottom: 12 },
  form: { backgroundColor: '#121922', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#223244', marginBottom: 12 },
  input: { backgroundColor: '#1a2430', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#243345', marginBottom: 8 },
  primary: { backgroundColor: '#4f8cff', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
  cardRow: { backgroundColor: '#121922', borderRadius: 14, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#223244', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCol: { flexShrink: 1, paddingRight: 10 },
  q: { color: 'white', fontWeight: '700' },
  a: { color: '#9fb7d1', marginTop: 4 },
  empty: { color: '#6c8199', marginTop: 20 },
  deleteBtn: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#38222a', borderRadius: 10 },
  deleteText: { color: '#ff7b7b', fontWeight: '700' },
  deleteDeckTop: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#38222a', borderRadius: 10 },
  bottomBar: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', gap: 10 },
  startBtn: { flex: 1, backgroundColor: '#4f8cff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  startText: { color: 'white', fontWeight: '700' }
});