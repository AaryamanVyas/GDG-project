import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../../context/AppProvider';

export default function TestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, recordTest, addCoins } = useApp();
  const router = useRouter();

  const deck = useMemo(() => state.decks.find(d => d.id === id), [state.decks, id]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [final, setFinal] = useState<{ score: number; total: number; correct: number; wrong: number; bestStreak: number } | null>(null);

  const flipAnim = useRef(new Animated.Value(0)).current; // 0 = front, 180 = back
  const translateX = useRef(new Animated.Value(0)).current;

  if (!deck || deck.cards.length === 0) {
    return <View style={styles.container}><Text style={styles.header}>Add cards to start a test.</Text></View>;
  }

  const total = deck.cards.length;
  const card = deck.cards[index];

  const isBackVisibleRef = useRef(false);
  const flip = () => {
    const toBack = !isBackVisibleRef.current;
    Animated.timing(flipAnim, { toValue: toBack ? 180 : 0, duration: 250, useNativeDriver: true }).start(() => {
      isBackVisibleRef.current = toBack;
    });
  };

  const finishAndSummarize = (saveHistory: boolean, correctCount: number, wrongCount: number) => {
    const score = Math.round((correctCount / total) * 100);
    const summary = { score, total, correct: correctCount, wrong: wrongCount, bestStreak };
    setFinal(summary);
    setFinished(true);
    if (saveHistory) {
      recordTest({ deckId: deck.id, score, total, bestStreak, correct: correctCount, wrong: wrongCount });
    }
  };

  const advance = (nextCorrect: number, nextWrong: number) => {
    const next = index + 1;
    if (next >= total || nextWrong >= 3) {
      finishAndSummarize(true, nextCorrect, nextWrong);
      return;
    }
    setIndex(next);
    setAnswered(false);
    isBackVisibleRef.current = false;
    flipAnim.setValue(0);
    translateX.setValue(0);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);

    let nextCorrect = correct;
    let nextWrong = wrong;

    if (isCorrect) {
      nextCorrect = correct + 1;
      setCorrect(nextCorrect);
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        addCoins(1 + (ns > 1 ? 1 : 0));
        return ns;
      });
    } else {
      nextWrong = wrong + 1;
      setWrong(nextWrong);
      setStreak(0);
    }

    setTimeout(() => advance(nextCorrect, nextWrong), 220);
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => isBackVisibleRef.current && Math.abs(g.dx) > 10,
    onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (!isBackVisibleRef.current) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
      if (g.dx > 80) {
        Animated.timing(translateX, { toValue: 300, duration: 150, useNativeDriver: true }).start(() => {
          translateX.setValue(0);
          handleAnswer(true);
        });
      } else if (g.dx < -80) {
        Animated.timing(translateX, { toValue: -300, duration: 150, useNativeDriver: true }).start(() => {
          translateX.setValue(0);
          handleAnswer(false);
        });
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    }
  })).current;

  const rotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 90], outputRange: [1, 0], extrapolate: 'clamp' });
  const backOpacity = flipAnim.interpolate({ inputRange: [90, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  if (finished && final) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{deck.name} - Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Score: {final.score}%</Text>
          <Text style={styles.summaryText}>Correct: {final.correct}</Text>
          <Text style={styles.summaryText}>Wrong: {final.wrong}</Text>
          <Text style={styles.summaryText}>Best streak: {final.bestStreak}</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.reveal} onPress={() => {
            setIndex(0);
            setAnswered(false);
            setCorrect(0);
            setWrong(0);
            setStreak(0);
            setBestStreak(0);
            setFinished(false);
            setFinal(null);
            isBackVisibleRef.current = false;
            flipAnim.setValue(0);
            translateX.setValue(0);
          }}>
            <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.correct} onPress={() => router.replace({ pathname: '/deck/[id]', params: { id: deck.id } })}>
            <Text style={styles.btnText}>Back to Deck</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>{deck.name} Test</Text>
        <TouchableOpacity onPress={() => finishAndSummarize(true, correct, wrong)}><Text style={styles.exitText}>Exit Test</Text></TouchableOpacity>
      </View>

      <Text style={styles.inlineMeta}>Correct: {correct}   Wrong: {wrong}/3   Streak: {streak}</Text>
      <Text style={styles.centerCounter}>Card {index + 1} / {total}</Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, { transform: [{ perspective: 1000 }, { rotateY: rotate }, { translateX }] }]}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={flip} style={styles.faceContainer}>
          <Animated.View style={[styles.face, styles.front, { opacity: frontOpacity }]}> 
            <Text style={styles.cardTitle}>Question</Text>
            <Text style={styles.cardText}>{card.question}</Text>
          </Animated.View>

          <Animated.View style={[styles.face, styles.back, { opacity: backOpacity }]}> 
            <Text style={styles.cardTitle}>Answer</Text>
            <Text style={styles.cardText}>{card.answer}</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.wrong} onPress={() => handleAnswer(false)}>
          <Text style={styles.btnText}>Wrong</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.correct} onPress={() => handleAnswer(true)}>
          <Text style={styles.btnText}>Correct</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 16 },
  centerCounter: { color: 'white', textAlign: 'center', marginBottom: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { color: 'white', fontSize: 22, fontWeight: '700' },
  exitText: { color: '#ff7b7b', fontWeight: '700' },
  inlineMeta: { color: '#9fb7d1', marginTop: 6, marginBottom: 6, textAlign: 'center' },
  card: { backgroundColor: '#121922', borderRadius: 14, padding: 20, marginTop: 8, borderWidth: 1, borderColor: '#223244', minHeight: 220 },
  faceContainer: { position: 'relative', height: 160, justifyContent: 'center' },
  face: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center' },
  front: {},
  back: { transform: [{ rotateY: '180deg' }] },
  cardTitle: { color: '#9fb7d1', fontWeight: '600', marginBottom: 8 },
  cardText: { color: 'white', fontSize: 18 },
  row: { flexDirection: 'row', gap: 12, marginTop: 20 },
  reveal: { flex: 1, backgroundColor: '#2a3647', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  wrong: { flex: 1, backgroundColor: '#38222a', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  correct: { flex: 1, backgroundColor: '#1e3a2f', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
  summaryCard: { backgroundColor: '#121922', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#223244' },
  summaryText: { color: 'white', marginBottom: 6 }
});