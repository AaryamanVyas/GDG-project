import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppProvider';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: Array<Array<{ date: Date | null }>> = [];
  let current = 1;

  for (let w = 0; w < 6; w++) {
    const week: Array<{ date: Date | null }> = [];
    for (let d = 0; d < 7; d++) {
      const cellIndex = w * 7 + d;
      if (cellIndex < startWeekday || current > daysInMonth) {
        week.push({ date: null });
      } else {
        week.push({ date: new Date(year, month, current) });
        current++;
      }
    }
    weeks.push(week);
  }

  return weeks;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ProgressScreen() {
  const { state } = useApp();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<Date | null>(
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const testsByDay = useMemo(() => {
    const map = new Map<string, typeof state.testHistory>();
    state.testHistory.forEach((t) => {
      const key = getDateKey(new Date(t.endedAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [state.testHistory]);

  const selectedKey = selected ? getDateKey(selected) : '';
  const selectedTests = selected ? testsByDay.get(selectedKey) ?? [] : [];

  const changeMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setSelected(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>
          {new Date(year, month, 1).toLocaleString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {matrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, di) => {
            if (!cell.date) {
              return (
                <View key={di} style={[styles.dayCell, { backgroundColor: 'transparent' }]} />
              );
            }

            const isSelected = selected && isSameDate(selected, cell.date);
            const hasTests = testsByDay.has(getDateKey(cell.date));

            return (
              <TouchableOpacity
                key={di}
                style={[styles.dayCell, isSelected && styles.daySelected]}
                onPress={() => setSelected(cell.date)}
              >
                <Text style={styles.dayText}>{cell.date.getDate()}</Text>
                {hasTests && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={styles.results}>
        <Text style={styles.subheader}>
          Results {selected ? `(${selected.toDateString()})` : ''}
        </Text>
        {selectedTests.length === 0 ? (
          <Text style={styles.empty}>No tests on this date.</Text>
        ) : (
          <FlatList
            data={selectedTests}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => (
              <View style={styles.resultRow}>
                <Text style={styles.resultText}>
                  Score {item.score}% • Streak {item.bestStreak}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', paddingTop: 60, paddingHorizontal: 12 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: { color: 'white', fontSize: 18, fontWeight: '700' },
  navBtn: { backgroundColor: '#2a3647', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  navText: { color: 'white', fontWeight: '700' },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekday: { color: '#9fb7d1', width: 40, textAlign: 'center' },

  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121922',
  },
  daySelected: { borderWidth: 2, borderColor: '#4f8cff' },
  dayText: { color: 'white' },
  dayDisabled: { color: '#495a6d' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4f8cff',
    position: 'absolute',
    bottom: 6,
  },

  results: { marginTop: 10, flex: 1 },
  subheader: { color: 'white', fontWeight: '700', marginBottom: 8 },
  resultRow: {
    backgroundColor: '#121922',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#223244',
    marginBottom: 8,
  },
  resultText: { color: 'white' },
  empty: { color: '#6c8199' },
});
