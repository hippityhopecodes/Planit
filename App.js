/**
 * @file App.js The main logic for the planning of tasks
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

// Storage key for AsyncStorage
const STORAGE_KEY = '@tasks_storage';

/**
 * Checks if two dates are the same based on the year, month, and day; returns true
 * if they are the same, false if otherwise.
 * @param {*} date1 
 * @param {*} date2 
 */
const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}
/**
 * Main App component that manages the task planning logic
 */
export default function App() {
    // Note: modal is a pop-up that allows users to add tasks
    // State variables for tasks, selected date, modal visibility
    const [tasks, setTasks] = useState([]);
    // State for the input field, selected date, and modal visibility
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);

    // Create a new task state variable
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load tasks from AsyncStorage when the component mounts (when the app starts)
    useEffect(() => {
        const loadedTasks = async () => {
           const jsonValueTasks = await AsyncStorage.getItem(STORAGE_KEY);
           // If there are tasks a user has not finished, load them
           if(jsonValueTasks) {
               setTasks(JSON.parse(jsonValueTasks));
           }
        }
        loadedTasks();
    }, []);

    // On every start of the app, as well as daily, carry over incompplete tasks
    useEffect(() => {
        rollOverIncompleteTasks();
    }, [tasks.length]);

    // Storage manager that will save tasks
    async function saveTasks(updatedTasks) {
        setTasks(updatedTasks);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    }

    // Carry over incomplete tasks from the previous day
    function rollOverIncompleteTasks() {
        const today = new Date();
        const updatedTasks = tasks.map(task => {
            const taskStart = new Date(task.startTime);
            const taskEnd = new Date(task.endTime);
            if (!task.done && taskStart < today) {
            const duration = taskEnd - taskStart;
            const newStart = new Date(today.setHours(9,0,0,0)); // e.g. 9AM today
            const newEnd = new Date(newStart.getTime() + duration);
            return {...task, startTime: newStart.toISOString(), endTime: newEnd.toISOString()};
          }
            return task;
        });
        saveTasks(updatedTasks);
    }

    // Filter tasks based on the selected date
    const tasksForSelectedDay = tasks.filter(task => isSameDay(new Date(task.startTime), selectedDate));

    // Mark a task as done
    function markAsDone(taskID) {
        const updatedTasks = tasks.map(task => {
            if(task.id === taskID) {
                return {...task, done: true};
            }
            return task;
        });
        saveTasks(updatedTasks);
    }

    // Add a new task
    function addTask() {
        if(!title) {
            Alert.alert("Invalid Task", "Please enter a title for your task.");
            return;
        }
        if(startTime >= endTime) {
            Alert.alert("Invalid Time", "Start time must be before end time.");
            return;
        }
        
        // Create a new task object with the current time and title
        const newTask = {
            id: Date.now().toString(),
            title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            done: false
        };

        // Add the new task to the list of tasks and save it
        const updatedTasks = [...tasks, newTask];
        saveTasks(updatedTasks);
        // Reset the input fields for future tasks
        setTitle('');
        setStartTime(new Date());
        setEndTime(new Date());
        setShowAddTaskModal(false);
    }

    // Format the time to normal 12-hour format
    function formatTime(iso) {
        const date = new Date(iso);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format and return
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    // Render the UI for the App interface
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Tasks for {selectedDate.toDateString()}
            </Text>
            
            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(e, selected) => {
                        setShowDatePicker(false);
                        if (selected) setSelectedDate(selected);
                    }}
                />
            )}

            {/* List of tasks for the selected day */}
            <FlatList
                data={tasksForSelectedDay}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text style={{ fontSize: 18 }}>
                            {item.title} ({formatTime(item.startTime)} - {formatTime(item.endTime)})
                        </Text>
                        <Text>Status: {item.done ? "✅ Done" : "❌ Not Done"}</Text>
                        {!item.done && (
                            <Button title="Mark as Done" onPress={() => markAsDone(item.id)} />
                        )}
                    </View>
                )}
            />

            <Button title="Add Task" onPress={() => setShowAddTaskModal(true)} />

            {/* Modal */}
            <Modal visible={showAddTaskModal} animationType="slide" transparent>
                <View style={{
                    flex: 1, justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <View style={{
                        backgroundColor: 'white', margin: 20, padding: 20,
                        borderRadius: 10, elevation: 5
                    }}>
                        <Text style={{ fontSize: 18 }}>Add Task</Text>
                        <TextInput
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                            style={{ borderBottomWidth: 1, marginBottom: 10 }}
                        />
                        <Button title="Pick Start Time" onPress={() => setShowStartTimePicker(true)} />
                        <Text>Start: {formatTime(startTime)}</Text>
                        <Button title="Pick End Time" onPress={() => setShowEndTimePicker(true)} />
                        <Text>End: {formatTime(endTime)}</Text>

                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={(e, selected) => {
                                    setShowStartTimePicker(false);
                                    if (selected) setStartTime(selected);
                                }}
                            />
                        )}
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={(e, selected) => {
                                    setShowEndTimePicker(false);
                                    if (selected) setEndTime(selected);
                                }}
                            />
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <Button title="Cancel" onPress={() => setShowAddTaskModal(false)} />
                            <Button title="Save Task" onPress={addTask} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}



