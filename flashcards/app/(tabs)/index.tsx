import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppProvider';

export default function DecksScreen() {
  const { state, addDeck, setOpenAIApiKey } = useApp();
  const [name, setName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(state.openaiApiKey ?? '');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>FlashMaster</Text>
        <TouchableOpacity style={styles.apiBtn} onPress={() => setShowKey(true)}>
          <Text style={styles.apiBtnText}>{state.openaiApiKey ? 'API Key ✓' : 'Set API Key'}</Text>
        </TouchableOpacity>
      </View>
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

      <Modal transparent visible={showKey} animationType="fade" onRequestClose={() => setShowKey(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>OpenAI API Key</Text>
            <TextInput
              placeholder="sk-..."
              placeholderTextColor="#7a8aa0"
              value={keyInput}
              onChangeText={setKeyInput}
              style={styles.modalInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.addBtn, { flex: 1 }]} onPress={() => { setOpenAIApiKey(keyInput.trim() || undefined); setShowKey(false); }}>
                <Text style={styles.addBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.apiBtn, { flex: 1, alignItems: 'center' }]} onPress={() => setShowKey(false)}>
                <Text style={styles.apiBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { color: 'white', fontSize: 24, fontWeight: '700' },
  apiBtn: { backgroundColor: '#2a3647', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  apiBtnText: { color: 'white', fontWeight: '700' },
  coins: { color: '#9fb7d1', marginTop: 6, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#1a2430', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#243345' },
  addBtn: { backgroundColor: '#4f8cff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: '700' },
  list: { paddingBottom: 40 },
  deck: { backgroundColor: '#121922', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#223244' },
  deckTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  deckMeta: { color: '#9fb7d1', marginTop: 4 },
  empty: { color: '#6c8199', marginTop: 20 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#0b0f14', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#223244' },
  modalTitle: { color: 'white', fontWeight: '700', marginBottom: 8 },
  modalInput: { backgroundColor: '#1a2430', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#243345' }
});


