// Gym Progress Tracker MVP
// Built with React Native + Expo, functional components, hooks, and AsyncStorage.

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key used to save/load workouts in AsyncStorage.
// Keeping it in a constant avoids typos if it's used in multiple places.
const STORAGE_KEY = '@gym_tracker_workouts';

export default function App() {
  // ---- State ----
  // Form inputs. TextInput always gives us strings, so all of these are strings.
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // The list of saved workouts. This is the "source of truth" for the UI.
  const [workouts, setWorkouts] = useState([]);

  // ---- Load saved workouts once when the app starts ----
  // The empty dependency array [] means this effect runs only on the first render.
  useEffect(() => {
    loadWorkouts();
  }, []);

  // Read workouts from AsyncStorage. Data is stored as a JSON string,
  // so we parse it back into an array before putting it in state.
  const loadWorkouts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setWorkouts(JSON.parse(stored));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load saved workouts.');
    }
  };

  // Save the workout list to AsyncStorage.
  // AsyncStorage only stores strings, so we JSON.stringify the array.
  const saveWorkouts = async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      Alert.alert('Error', 'Could not save workouts.');
    }
  };

  // ---- Add a workout ----
  const addWorkout = () => {
    // Validation 1: exercise name is required.
    if (exercise.trim() === '') {
      Alert.alert('Missing info', 'Please enter an exercise name.');
      return;
    }

    // Validation 2: sets, reps, and weight must be valid positive numbers.
    // Number('') is 0 and Number('abc') is NaN, so this catches both
    // empty and non-numeric input.
    const setsNum = Number(sets);
    const repsNum = Number(reps);
    const weightNum = Number(weight);

    if (
      sets.trim() === '' || reps.trim() === '' || weight.trim() === '' ||
      isNaN(setsNum) || isNaN(repsNum) || isNaN(weightNum) ||
      setsNum <= 0 || repsNum <= 0 || weightNum <= 0
    ) {
      Alert.alert('Invalid input', 'Sets, reps, and weight must be positive numbers.');
      return;
    }

    // Build the new workout object.
    // Date.now() gives a unique-enough id for this simple app.
    const newWorkout = {
      id: Date.now().toString(),
      exercise: exercise.trim(),
      sets: setsNum,
      reps: repsNum,
      weight: weightNum,
      notes: notes.trim(),
      date: new Date().toLocaleDateString(),
    };

    // Put the newest workout at the top of the list.
    // We create a NEW array (spread operator) instead of mutating state,
    // which is how React knows to re-render.
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    saveWorkouts(updated);

    // Clear the form so it's ready for the next entry.
    setExercise('');
    setSets('');
    setReps('');
    setWeight('');
    setNotes('');
  };

  // ---- Delete a workout ----
  // Asks for confirmation first so users don't delete by accident.
  const deleteWorkout = (id) => {
    Alert.alert('Delete workout', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // filter() returns a new array without the deleted item.
          const updated = workouts.filter((w) => w.id !== id);
          setWorkouts(updated);
          saveWorkouts(updated);
        },
      },
    ]);
  };

  // ---- Summary values ----
  // Total volume for one workout = sets × reps × weight.
  // reduce() adds up the volume of every workout in the list.
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce(
    (sum, w) => sum + w.sets * w.reps * w.weight,
    0
  );

  // ---- Render one workout card ----
  const renderWorkout = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.exercise}</Text>
        <TouchableOpacity onPress={() => deleteWorkout(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDetail}>
        {item.sets} sets × {item.reps} reps × {item.weight} lbs
      </Text>
      <Text style={styles.cardVolume}>
        Total volume: {item.sets * item.reps * item.weight} lbs
      </Text>

      {/* Only show the notes line if notes exist */}
      {item.notes !== '' && <Text style={styles.cardNotes}>{item.notes}</Text>}

      <Text style={styles.cardDate}>Added {item.date}</Text>
    </View>
  );

  // ---- Header: summary + input form ----
  // Rendered as the FlatList header so the whole screen scrolls together.
  const renderHeader = () => (
    <View>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>{totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>{totalVolume.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Volume (lbs)</Text>
        </View>
      </View>

      {/* Add-workout form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Exercise name (e.g. Bench Press)"
          value={exercise}
          onChangeText={setExercise}
        />

        {/* Sets / reps / weight share one row to save space */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Sets"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Reps"
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
          <Text style={styles.addButtonText}>+ Add Workout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>History</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView stops the keyboard from covering inputs on iOS */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.appTitle}>Gym Progress Tracker</Text>

        {/* FlatList renders the workout history.
            The form and summary live in ListHeaderComponent so everything
            scrolls as one screen (nesting a FlatList inside a ScrollView
            is a React Native anti-pattern). */}
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkout}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No workouts yet</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7', // soft gray background so white cards stand out
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: '#1a1a2e',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#c7c9d9',
    marginTop: 4,
  },
  // Form
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f2f4f7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  smallInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4361ee',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1a1a2e',
  },
  // Workout cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // subtle shadow (iOS) + elevation (Android)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  deleteText: {
    color: '#e63946',
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetail: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  cardVolume: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4361ee',
    marginBottom: 4,
  },
  cardNotes: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 20,
  },
});