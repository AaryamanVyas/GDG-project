import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  question: string;
  answer: string;
  style?: ViewStyle;
};

export const Flashcard: React.FC<Props> = ({ question, answer, style }) => {
  const [back, setBack] = useState(false);
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotate = rotateY.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const flip = () => {
    Animated.timing(rotateY, { toValue: back ? 0 : 1, duration: 300, useNativeDriver: true }).start(() => setBack(!back));
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ rotateY: rotate }] }, style]}>
      <TouchableOpacity onPress={flip} activeOpacity={0.8}>
        <Text style={styles.title}>{back ? 'Answer' : 'Question'}</Text>
        <Text style={styles.text}>{back ? answer : question}</Text>
        <Text style={styles.hint}>(Tap to flip)</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#121922', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#223244' },
  title: { color: '#9fb7d1', fontWeight: '600', marginBottom: 6 },
  text: { color: 'white', fontSize: 16 },
  hint: { color: '#6c8199', fontSize: 12, marginTop: 8 }
});