import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../../context/AppProvider';

type MCQ = { question: string; choices: string[]; correctIndex: number };

type AnswerItem = {
  question: string;
  choices: string[];
  correctIndex: number;
  chosenIndex: number;
  isCorrect: boolean;
};

function tryParseArray(text: string): MCQ[] {
  // Try code fences first
  const fenced = text.match(/```[\s\S]*?```/);
  if (fenced) {
    const inner = fenced[0].replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    try {
      const val = JSON.parse(inner);
      if (Array.isArray(val)) return val as MCQ[];
      if (val && typeof val === 'object' && Array.isArray((val as any).mcqs)) return (val as any).mcqs as MCQ[];
    } catch {}
  }
  // Try extracting array slice
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const slice = text.slice(start, end + 1);
    try { const arr = JSON.parse(slice); if (Array.isArray(arr)) return arr; } catch {}
  }
  // Try direct parse as array or object with mcqs
  try {
    const val = JSON.parse(text);
    if (Array.isArray(val)) return val as MCQ[];
    if (val && typeof val === 'object' && Array.isArray((val as any).mcqs)) return (val as any).mcqs as MCQ[];
  } catch {}
  return [];
}

async function callOpenRouter(apiKey: string, model: string, prompt: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Reply with ONLY JSON. Either a JSON array of MCQs, or {"mcqs": [...]}.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })
  });
  return res;
}

async function generateQuizFromOpenRouter(apiKey: string, deckName: string, cards: { question: string; answer: string }[]): Promise<MCQ[]> {
  const prompt = [
    'Generate 5 MCQs as JSON only. Each item must be:',
    '{ "question": string, "choices": string[4], "correctIndex": 0|1|2|3 }',
    `Deck: "${deckName}"`,
    'Cards:',
    ...cards.map(c => `- Q: ${c.question} | A: ${c.answer}`)
  ].join('\n');

  const models = [
    'openai/gpt-4o-mini',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3.1-8b-instruct',
    'google/gemma-2-9b-it',
  ];

  let lastRaw = '';
  let lastErr: string | null = null;
  for (const model of models) {
    try {
      const res = await callOpenRouter(apiKey, model, prompt);
      if (!res.ok) {
        const errText = await res.text();
        lastErr = `OpenRouter error ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? '';
      lastRaw = text;
      const parsed = tryParseArray(text);
      if (parsed.length > 0) return parsed;
      lastErr = 'AI returned JSON that could not be parsed into MCQs';
    } catch (e: any) {
      lastErr = e?.message ?? 'Unknown error';
    }
  }
  if (lastErr) throw new Error(`${lastErr}. Raw: ${lastRaw.slice(0, 200)}`);
  return [];
}

function fallbackQuiz(cards: { question: string; answer: string }[]): MCQ[] {
  return cards.slice(0, 5).map(c => ({
    question: c.question,
    choices: [c.answer, 'Not sure', 'Another option', 'None of the above'],
    correctIndex: 0
  }));
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, recordTest, addCoins } = useApp();
  const router = useRouter();

  const deck = useMemo(() => state.decks.find(d => d.id === id), [state.decks, id]);
  const [mcqs, setMcqs] = useState<MCQ[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    (async () => {
      if (!deck) return;
      let qs: MCQ[] = [];
      if (state.openaiApiKey) {
        try {
          const out = await generateQuizFromOpenRouter(state.openaiApiKey, deck.name, deck.cards);
          if (out && out.length > 0) {
            qs = out;
          } else {
            Alert.alert('AI returned no questions', 'Using fallback MCQs instead.');
          }
        } catch (e: any) {
          Alert.alert('AI error', (e?.message ?? 'Unknown error').slice(0, 300));
        }
      }
      if (!qs || qs.length === 0) qs = fallbackQuiz(deck.cards);
      setMcqs(qs);
      setLoading(false);
    })();
  }, [deck, state.openaiApiKey]);

  if (!deck) return <View style={styles.container}><Text style={styles.header}>Deck not found</Text></View>;
  if (loading || !mcqs) return <View style={styles.container}><ActivityIndicator color="#4f8cff" /><Text style={styles.meta}>Generating quiz...</Text></View>;

  const question = mcqs[current];

  const persistAttempt = async (finalScore: number, finalAnswers: AnswerItem[]) => {
    const attempt = {
      type: 'quiz',
      deckId: deck.id,
      deckName: deck.name,
      total: mcqs.length,
      score: finalScore,
      endedAt: Date.now(),
      items: finalAnswers,
    };
    try {
      const key = `@flashmaster_quiz_${deck.id}_${attempt.endedAt}`;
      await AsyncStorage.setItem(key, JSON.stringify(attempt));
    } catch {}
  };

  const proceed = async (nextScore: number, nextAnswers: AnswerItem[]) => {
    if (current + 1 >= mcqs.length) {
      const pct = Math.round((nextScore / mcqs.length) * 100);
      setAnswers(nextAnswers);
      await persistAttempt(pct, nextAnswers);
      recordTest({ deckId: deck.id, score: pct, total: mcqs.length, bestStreak, correct: nextScore, wrong: mcqs.length - nextScore });
      router.replace({ pathname: '/deck/[id]', params: { id: deck.id } });
      return;
    }
    setScore(nextScore);
    setAnswers(nextAnswers);
    setCurrent(current + 1);
    setSelectedIdx(null);
  };

  const choose = (idx: number) => {
    if (selectedIdx !== null) return; // already chosen
    setSelectedIdx(idx);

    const isCorrect = idx === question.correctIndex;
    let nextScore = score;
    if (isCorrect) {
      nextScore = score + 1;
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        addCoins(1 + (ns > 1 ? 1 : 0));
        return ns;
      });
    } else {
      setStreak(0);
    }

    const nextAnswers = [
      ...answers,
      {
        question: question.question,
        choices: question.choices,
        correctIndex: question.correctIndex,
        chosenIndex: idx,
        isCorrect,
      },
    ];

    // Show feedback colors briefly, then proceed
    setTimeout(() => { proceed(nextScore, nextAnswers); }, 700);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{deck.name} • Quiz</Text>
      <Text style={styles.meta}>Question {current + 1} / {mcqs.length} • Correct so far: {score}</Text>

      <View style={styles.card}>
        <Text style={styles.qText}>{question.question}</Text>
      </View>

      <View style={{ gap: 10, marginTop: 12 }}>
        {question.choices.map((c, i) => {
          const isChosen = selectedIdx === i;
          const isCorrectChoice = selectedIdx !== null && i === question.correctIndex;
          const isWrongChosen = selectedIdx !== null && isChosen && i !== question.correctIndex;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.choice,
                isCorrectChoice && styles.choiceCorrect,
                isWrongChosen && styles.choiceWrong,
              ]}
              activeOpacity={0.8}
              onPress={() => choose(i)}
              disabled={selectedIdx !== null}
            >
              <Text style={styles.choiceText}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 16 },
  header: { color: 'white', fontSize: 22, fontWeight: '700' },
  meta: { color: '#9fb7d1', marginTop: 6, marginBottom: 12 },
  card: { backgroundColor: '#121922', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#223244' },
  qText: { color: 'white', fontSize: 18 },
  choice: { backgroundColor: '#1a2430', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: '#243345' },
  choiceCorrect: { backgroundColor: '#1e3a2f', borderColor: '#227a52' },
  choiceWrong: { backgroundColor: '#38222a', borderColor: '#7a2222' },
  choiceText: { color: 'white', fontWeight: '600' }
});

