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

    // Load tasks from AsyncStorage when the component mounts (when the app starts)
    useEffect(() => {
        const loadedTasks = async () => {
           const jsonValueTasks = await AsyncStorage.getItem(STORAGE_KEY);
           // If there are tasks a user has not finished, load them
           if(jsonValueTasks) {
               setTasks(JSON.parse(jsonValueTasks));
           }
        }
    })
}



