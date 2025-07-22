import {Modal, TextInput, TouchableOpacity, View, Text, StyleSheet, Switch} from "react-native";
import {useCallback, useState, useEffect} from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Clock, Calendar, FileText, Bell } from 'lucide-react-native';
import {Dropdown} from "react-native-element-dropdown";


export default function EditTaskModal({ visibility , taskObject, onClose, onSaveTask}) {
    const [editTitle, setEditTitle] = useState(taskObject.title);
    const [editDate, setEditDate] = useState(new Date(taskObject.date));
    const [editTime, setEditTime] = useState(taskObject.time || "12:00");
    const [editDescription, setEditDescription] = useState(taskObject.description);
    // Change this to string, not Date
    const [editReminderTime, setEditReminderTime] = useState(taskObject.reminderTime || '0');

    const [dateEnabled, setDateEnabled] = useState(false);
    const [timeEnabled, setTimeEnabled] = useState(false);

    useEffect(() => {
        setEditTitle(taskObject.title || '');
        setEditDate(new Date(taskObject.date));
        setEditTime(taskObject.time || "12:00"); // Keep as string
        setEditDescription(taskObject.description || '');
        setEditReminderTime(taskObject.reminderTime || '0');
    }, [taskObject]);

    useEffect(() => {
        editDate ? setDateEnabled(true) : setDateEnabled(false);
    } , [editDate]);

    const saveTask = useCallback(() => {
        const newTask = {...taskObject,
            title:editTitle,
            date:editDate,
            time:editTime,
            description: editDescription,
            reminderTime:editReminderTime,
        };
        onSaveTask(newTask);
        onClose();
    },[taskObject, editTitle, editDate, editTime, editDescription, editReminderTime, onSaveTask, onClose])

    const timeOptions = [
        { label: 'No reminder', value: '0' },
        { label: '5 minutes before', value: '5' },
        { label: '10 minutes before', value: '10' },
        { label: '15 minutes before', value: '15' },
        { label: '30 minutes before', value: '30' },
        { label: '1 hour before', value: '60' },
        { label: '2 hours before', value: '120' },
        { label: '1 day before', value: '1440' },
    ];

    // Get display text for selected reminder
    const getReminderDisplayText = () => {
        const option = timeOptions.find(opt => opt.value === editReminderTime);
        return option ? option.label : 'No reminder';
    };

    const getDateDisplayText = (editDate) => {
        if(editDate) {
            return editDate.toLocaleDateString()
        } else {
            return "No Date";
        }
    }

    if (!visibility) {
        return null;
    }

    return (
        <Modal
            visible={visibility}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            {/* BG container */}
            <View style={styles.backgroundContainer}>
                {/* Edit container */}
                <View style={styles.container}>
                    {/* Title of container */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Edit ToDo</Text>
                    </View>
                    {/* Title editor */}
                    <View style={styles.titleEditor}>
                        <Text style={styles.titleText}>Title</Text>
                        <TextInput value={editTitle} onChangeText={(e) => setEditTitle(e)} style={styles.titleTextInput}/>
                    </View>
                    {/* Details container */}
                    <View>
                        <Text style={styles.detailsText}>Details</Text>
                        {/* Date editor */}
                        <View style={styles.datePickerContainer}>
                            <Calendar size={25} color="#666" />

                            <DateTimePicker
                                value={editDate ? editDate : new Date()}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setEditDate(selectedDate);
                                }}
                            />

                            <Switch
                                value={dateEnabled}
                                onValueChange={(value) => {
                                    setDateEnabled(value);
                                    if(!value) {
                                        setEditDate(null);
                                    }
                                }}
                                trackColor={{ false: '#ccc', true: '#007AFF' }}
                                thumbColor={dateEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Time editor */}
                        <View style={styles.timePickerContainer}>
                            <Clock size={25} color="#666" />

                            <DateTimePicker
                                value={new Date(`2000-01-01T${editTime}:00`)} // Convert string to Date for picker
                                mode="time"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        // Convert Date back to HH:MM string
                                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                                        setEditTime(`${hours}:${minutes}`);
                                    }
                                }}
                            />
                            <Switch
                                value={timeEnabled}
                                onValueChange={(value) => {
                                    setTimeEnabled(value);
                                    if(!value) {
                                        setEditTime(null);
                                    }
                                }}
                                trackColor={{ false: '#ccc', true: '#007AFF' }}
                                thumbColor={timeEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Reminder Editor */}
                        <View style={styles.reminderEditor}>
                            <Bell size={25} color="#666"  />
                            <Dropdown
                                style={styles.reminderDropdown}
                                data={timeOptions}
                                labelField="label"
                                valueField="value"
                                placeholder="Select reminder time"
                                value={editReminderTime}
                                onChange={(item) => {
                                    setEditReminderTime(item.value);
                                }}
                            />
                        </View>
                        {/* Description Editor */}
                        <View style={styles.descriptionEditorContainer}>
                            <FileText size={25} color="#666" />
                            <TextInput value={editDescription} onChangeText={(e) =>
                                setEditDescription(e)} style={styles.descriptionEditor}
                                placeholder="Add description..."
                                multiline={true}              // Important for multi-line text
                                textAlignVertical="top" />
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => onClose()} style={styles.buttonCancel}>
                            <Text style={styles.buttonTextCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => saveTask()} style={styles.buttonSave}>
                            <Text style={styles.buttonTextSave}>Save</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backgroundContainer: {
        height: '100%',
        width: '100%',
        alignItems: "center",
        justifyContent: 'center',
    },
    container: {
        backgroundColor: '#fff',
        height: '50%',
        width: '80%',
        borderColor: 'purple',
        borderWidth: 3,
        borderRadius: 10,
    },
    header: {
        alignSelf: 'center',
        paddingVertical: 15,
    },
    headerText: {
        fontSize: 20,
        color: 'black',
        fontWeight: "bold",
    },
    titleEditor: {
        paddingLeft: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    titleText: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 5,
    },
    titleTextInput: {
        paddingLeft: 15,
        borderWidth: 1,
        borderColor: 'purple',
        borderRadius: 5,
        width: '90%',
        height: 30,
    },
    detailsText: {
        paddingTop: 15,
        paddingLeft: 15,
        fontWeight: "bold"
    },
    datePickerContainer: {
        paddingTop: 10,
        paddingLeft: 15,
        flexDirection: 'row',
    },

    datePicker: {
        paddingLeft: 15,
    },

    datePickerText: {
        fontSize: 18,
    },

    timePickerContainer: {
        paddingTop: 10,
        paddingLeft: 15,
        flexDirection: 'row',
    },
    timePicker: {
        paddingLeft: 15,
    },
    reminderEditor: {
        paddingTop: 10,
        paddingLeft: 15,
        flexDirection: 'row',
    },
    reminderDropdown: {
        marginLeft: 10,
        flex: 1, // Takes remaining space in row
        height: 30,
        borderColor: 'purple',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginRight:30, // Add right margin
    },
    descriptionEditorContainer: {
        paddingTop: 10,
        paddingLeft: 15,
        flexDirection: 'row',
    },
    descriptionEditor: {
        marginLeft: 10,
        borderWidth: 1,
        borderColor: "purple",
        flex: 1,
        marginRight:30,
        height: 60,
        textAlignVertical: "top",
        paddingTop: 5,
        paddingLeft: 5,
    },
    buttonSave: {
        width: 80,
        marginTop: 20,
        backgroundColor: "purple",
        padding: 10,
        borderRadius: 10
    },
    buttonCancel: {
        width: 80,
        marginTop: 20,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        borderColor: "purple",
        borderWidth: 2,
    },
    buttonTextSave: {
        alignSelf: "center",
        color: "white",
        fontWeight: "bold",

    },
    buttonTextCancel: {
        alignSelf: "center"
    }


})