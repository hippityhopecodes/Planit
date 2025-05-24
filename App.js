/**
 * @file App.js The main logic for the planning of tasks
 * @author Hope Spence
 */
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Modal,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const STORAGE_KEY = '@tasks_storage';

const isSameDay = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  card: '#F0F0F0',
  border: '#CCCCCC',
  modalBackground: '#FFFFFF',
  placeholder: '#666',
};

const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  card: '#1E1E1E',
  border: '#444444',
  modalBackground: '#1E1E1E',
  placeholder: '#888',
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadedTasks = async () => {
      const jsonValueTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValueTasks) setTasks(JSON.parse(jsonValueTasks));
    };
    loadedTasks();
  }, []);

  useEffect(() => {
    rollOverIncompleteTasks();
  }, [tasks.length]);

  async function saveTasks(updatedTasks) {
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  }

  function rollOverIncompleteTasks() {
    const today = new Date();
    const updatedTasks = tasks.map((task) => {
      const taskDate = new Date(task.startTime);
      if (!task.done && taskDate < today) {
        return { ...task, startTime: today.toISOString(), endTime: today.toISOString() };
      }
      return task;
    });
    saveTasks(updatedTasks);
  }

  const tasksForSelectedDay = tasks.filter((task) =>
    isSameDay(new Date(task.startTime), selectedDate)
  );

  function markAsDone(taskID) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskID) return { ...task, done: true };
      return task;
    });
    saveTasks(updatedTasks);
  }

  function addTask() {
    if (!title) {
      Alert.alert('Invalid Task', 'Please enter a title for your task.');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'Start time must be before end time.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      done: false,
    };

    saveTasks([...tasks, newTask]);
    setTitle('');
    const newStart = new Date();
    setStartTime(newStart);
    const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
    setEndTime(newEnd);
    setShowAddTaskModal(false);
  }

  function formatTime(iso) {
    const date = new Date(iso);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  // Custom iOS modal wrapper for DateTimePicker with fixed colors and styling
  const IOSDatePickerModal = ({ visible, onClose, value, mode, onChange }) => {
    if (Platform.OS !== 'ios') return null;
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: theme.modalBackground,
              padding: 10,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10,
            }}
          >
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              onChange={(e, selectedDate) => {
                onChange(e, selectedDate);
              }}
              style={{
                backgroundColor: theme.modalBackground,
              }}
              textColor={theme.text} // iOS 14+ only
            />
            <Button title="Done" onPress={onClose} color={theme.text} />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>
          Tasks for{' '}
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          })}
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <Button title="Change Date" onPress={() => setShowDatePicker(true)} />
      </View>

      {/* Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      <IOSDatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        mode="date"
        onChange={(e, date) => {
          if (date) setSelectedDate(date);
        }}
        onClose={() => setShowDatePicker(false)}
      />

      <FlatList
        data={tasksForSelectedDay}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ fontSize: 18, color: theme.text }}>
              {item.title} ({formatTime(item.startTime)} - {formatTime(item.endTime)})
            </Text>
            <Text style={{ color: theme.text }}>
              Status: {item.done ? '✅ Done' : '❌ Not Done'}
            </Text>
            {!item.done && (
              <Button title="Mark as Done" onPress={() => markAsDone(item.id)} />
            )}
          </View>
        )}
      />

      <Button
        title="Add Task"
        onPress={() => {
          const now = new Date();
          setStartTime(now);
          setEndTime(new Date(now.getTime() + 60 * 60 * 1000)); // one hour later
          setTitle('');
          setShowAddTaskModal(true);
        }}
      />

      {/* Add Task Modal */}
      <Modal visible={showAddTaskModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: theme.modalBackground,
              margin: 20,
              padding: 20,
              borderRadius: 10,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 18, color: theme.text, marginBottom: 10 }}>
              Add Task
            </Text>
            <TextInput
              placeholder="Title"
              placeholderTextColor={theme.placeholder}
              value={title}
              onChangeText={setTitle}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                color: theme.text,
                marginBottom: 10,
              }}
            />

            <View style={{ marginBottom: 10 }}>
              <Button title="Pick Start Time" onPress={() => setShowStartTimePicker(true)} />
              <Text style={{ color: theme.text, marginTop: 5 }}>
                Start: {formatTime(startTime.toISOString())}
              </Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Button title="Pick End Time" onPress={() => setShowEndTimePicker(true)} />
              <Text style={{ color: theme.text, marginTop: 5 }}>
                End: {formatTime(endTime.toISOString())}
              </Text>
            </View>

            {/* Android Time Pickers */}
            {Platform.OS === 'android' && showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selected) => {
                  setShowStartTimePicker(false);
                  if (selected) setStartTime(selected);
                }}
              />
            )}
            {Platform.OS === 'android' && showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selected) => {
                  setShowEndTimePicker(false);
                  if (selected) setEndTime(selected);
                }}
              />
            )}

            {/* iOS Time Pickers in Modal */}
            <IOSDatePickerModal
              visible={showStartTimePicker}
              value={startTime}
              mode="time"
              onChange={(e, date) => {
                if (date) setStartTime(date);
              }}
              onClose={() => setShowStartTimePicker(false)}
            />
            <IOSDatePickerModal
              visible={showEndTimePicker}
              value={endTime}
              mode="time"
              onChange={(e, date) => {
                if (date) setEndTime(date);
              }}
              onClose={() => setShowEndTimePicker(false)}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Cancel" onPress={() => setShowAddTaskModal(false)} />
              <Button title="Save Task" onPress={addTask} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
