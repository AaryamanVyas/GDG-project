import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Ctx, TestResult } from './types';

const defaultState: AppState = { decks: [], coins: 0, testHistory: [] };
const AppContext = createContext<Ctx | null>(null);

const STORAGE_KEY = '@flashmaster_state_v1';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(err =>
      console.error('Failed to save state:', err)
    );
  }, [state, hydrated]);

  const addDeck = (name: string) => {
    if (!name.trim()) return;
    setState(s => ({
      ...s,
      decks: [
        { id: generateId(), name: name.trim(), cards: [], createdAt: Date.now() },
        ...s.decks,
      ],
    }));
  };

  const deleteDeck = (id: string) => {
    setState(s => ({ ...s, decks: s.decks.filter(d => d.id !== id) }));
  };

  const addCard = (deckId: string, question: string, answer: string) => {
    if (!question.trim() || !answer.trim()) return;
    setState(s => ({
      ...s,
      decks: s.decks.map(d =>
        d.id === deckId
          ? {
              ...d,
              cards: [
                { id: generateId(), question: question.trim(), answer: answer.trim() },
                ...d.cards,
              ],
            }
          : d
      ),
    }));
  };

  const deleteCard = (deckId: string, cardId: string) => {
    setState(s => ({
      ...s,
      decks: s.decks.map(d =>
        d.id === deckId ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
      ),
    }));
  };

  const recordTest = (result: Omit<TestResult, 'id' | 'endedAt'>) => {
    const entry: TestResult = { ...result, id: generateId(), endedAt: Date.now() };
    setState(s => ({ ...s, testHistory: [entry, ...s.testHistory] }));
  };

  const addCoins = (amount: number) =>
    setState(s => ({ ...s, coins: Math.max(0, s.coins + amount) }));

  const setOpenAIApiKey = (key: string | undefined) =>
    setState(s => ({ ...s, openaiApiKey: key }));

  if (!hydrated) return null; // Or show splash/loading

  return (
    <AppContext.Provider
      value={{
        state,
        addDeck,
        deleteDeck,
        addCard,
        deleteCard,
        recordTest,
        addCoins,
        setOpenAIApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
