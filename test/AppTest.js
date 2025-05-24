/**
 * @file AppTest.js tests the local state logic of Planit
 * @author Hope Spence
 */
import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    TouchableOpacity,
    Modal,
    Platform,
    Alert
} from 'react-native';

const TaskModalTest = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (taskName && startTime && endTime) {
      setTasks(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: taskName,
          start: startTime,
          end: endTime,
        },
      ]);
      setTaskName('');
      setStartTime('');
      setEndTime('');
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Add Task" onPress={() => setModalVisible(true)} />

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskText}>{item.name}</Text>
            <Text style={styles.taskTime}>{item.start} - {item.end}</Text>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Task</Text>
            <TextInput
              placeholder="Task Name"
              style={styles.input}
              value={taskName}
              onChangeText={setTaskName}
            />
            <TextInput
              placeholder="Start Time (e.g., 9:00 AM)"
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
            />
            <TextInput
              placeholder="End Time (e.g., 10:00 AM)"
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
            />
            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save Task" onPress={addTask} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TaskModalTest;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  taskCard: { padding: 12, marginVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 8 },
  taskText: { fontSize: 16, fontWeight: '600' },
  taskTime: { fontSize: 14, color: '#555' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', margin: 20, borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginVertical: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
