import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Alert
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = "http://192.168.243.79:5000/get_tasks"; // Backend API

const TimelineScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);


  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("Raw Data from Backend:", data);
  
        // Correctly extract data from the response
        const formattedData = data.map((task) => ({
          id: task.id, 
          title: task.title, 
          description: task.content,  
          week_start: task.starting_week, 
          week_end: task.ending_week, 
          priority: task.task_priority, 
          isOptional: task.isOptional,
          status: task.task_status, 
        }));
  
        console.log("Formatted Data:", formattedData);
  
        // Sort by date
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
        setAppointments(formattedData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAppointments();
  }, []);
  
  

  const markTaskAsDone = (taskId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedAppointments = appointments.map((task) => {
      if (task.id === taskId) return { ...task, status: "completed" };
      return task;
    });
    setAppointments(updatedAppointments);
  };

  const makeappointment = async () => {
    if (!location) {
      Alert.alert("Error", "Please enter the appointment location.");
      return;
    }

    try {
      const response = await fetch(`http://192.168.243.79:5000/move_to_appointment/${selectedTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date: appointmentDate.toISOString().split("T")[0],
          appointment_time: appointmentTime.toLocaleTimeString(),
          appointment_location: location,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Appointment created successfully!");
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Something went wrong!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to make an appointment!");
    }
  };

  const getTaskColor = (status) => {
    return status === "completed" ? "#87CEFA" : "#FFC0CB"; // Blue for completed, Pink for pending
  };

  const getBarColor = (status) => {
    return status === "completed" ? "#87CEEB" : "#FFB6C1"; // Blue for completed, Light Pink for pending
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF4081" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <View style={styles.timelineContainer}>
              <View style={styles.timelineIndicator}>
                <View style={[styles.circle, { backgroundColor: getTaskColor(item.status) }]} />
                {index !== appointments.length - 1 && <View style={[styles.line, { backgroundColor: getBarColor(item.status) }]} />}
              </View>

              <View style={[styles.timelineItem, { backgroundColor: getTaskColor(item.status) }]}>  
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.details}>📅 Week {item.week_start} - Week {item.week_end}</Text>
                <Text style={styles.details}> Priority : {item.priority}</Text>
                <Text style={styles.details}> id: {item.id}</Text>
                {item.status === "pending" && (
                  <TouchableOpacity style={styles.doneButton} onPress={() => markTaskAsDone(item.id)}>
                    <Text style={styles.doneButtonText}>Mark as Done</Text>
                  </TouchableOpacity>  
                )}
                <TouchableOpacity 
                  style={styles.doneButton} 
                   onPress={() => {
                    setSelectedTaskId(item.id);  // Store the task ID
                    setModalVisible(true);       // Open the modal
                }}
                >
  <Text style={styles.doneButtonText}>Make Appointment</Text>
</TouchableOpacity>

                  {/* MODAL */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ width: 300, backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Set Appointment</Text>

            {/* Date Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={{ padding: 10, backgroundColor: "#eee", marginBottom: 10 }}>Select Date: {appointmentDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setAppointmentDate(selectedDate);
                }}
              />
            )}

            {/* Time Picker */}
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={{ padding: 10, backgroundColor: "#eee", marginBottom: 10 }}>Select Time: {appointmentTime.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={appointmentTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setAppointmentTime(selectedTime);
                }}
              />
            )}

            {/* Location Input */}
            <TextInput
              placeholder="Enter appointment location"
              value={location}
              onChangeText={setLocation}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 }}
            />

            {/* Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
              <Button title="Confirm" onPress={makeappointment} color="green" />
            </View>
          </View>
        </View>
      </Modal>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  timelineContainer: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 5 },
  timelineIndicator: { alignItems: "center", marginRight: 10 },
  circle: { marginTop:19, width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, minHeight: 50, marginVertical: 5 },
  timelineItem: { flex: 1, padding: 15, borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  description: { fontSize: 14, color: "#666", marginTop: 5 },
  details: { fontSize: 12, color: "#888", marginTop: 2 },
  doneButton: { marginTop: 10, padding: 8, backgroundColor: "#ffffff", borderRadius: 8, alignItems: "center" },
  doneButtonText: { color: "#000000", fontSize: 14, fontWeight: "bold" },
});

export default TimelineScreen;



// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   LayoutAnimation,
//   UIManager,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";

// if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const API_URL = "http://192.168.1.7:5000/get_appointments"; 

// const TimelineScreen = ({ navigation }) => {
//   const [timeline, setTimeline] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const response = await fetch(API_URL);
//         const data = await response.json();
//         console.log("Response:", data);
//         setTimeline(data);
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, []);

//   const markTaskAsDone = (taskId) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     const updatedTimeline = timeline.map((task) => {
//       if (task.id === taskId) return { ...task, status: "done" };
//       if (task.status === "current") return { ...task, status: "upcoming" };
//       return task;
//     });
//     const nextCurrentTaskIndex = updatedTimeline.findIndex((task) => task.status === "upcoming");
//     if (nextCurrentTaskIndex !== -1) updatedTimeline[nextCurrentTaskIndex].status = "current";
//     setTimeline(updatedTimeline);
//   };

//   const getTaskColor = (status) => {
//     switch (status) {
//       case "done": return "#87CEFA"; // Blue for completed
//       case "pending": return "#FFC0CB"; // Pink for pending
//       case "current": return "#FFC0CB"; // Pink for current
//       case "upcoming": return "#F5F5F5"; // Grey for upcoming
//       default: return "#F5F5F5";
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="black" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Timeline</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#FF4081" style={{ marginTop: 50 }} />
//       ) : (
//         <FlatList
//           data={timeline}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={{ paddingBottom: 20 }}
//           renderItem={({ item, index }) => (
//             <View style={styles.timelineContainer}>
//               <View style={styles.timelineIndicator}>
//                 <View style={[styles.circle, { backgroundColor: getTaskColor(item.status) }]} />
//                 {index !== timeline.length - 1 && <View style={styles.line} />}
//               </View>

//               <View style={[styles.timelineItem, { backgroundColor: getTaskColor(item.status) }]}>
//                 <Text style={styles.weekTitle}>Week {item.week}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 {item.status === "current" && (
//                   <TouchableOpacity style={styles.doneButton} onPress={() => markTaskAsDone(item.id)}>
//                     <Text style={styles.doneButtonText}>Done</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15 },
//   headerTitle: { fontSize: 18, fontWeight: "bold" },
//   timelineContainer: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 5 },
//   timelineIndicator: { alignItems: "center", marginRight: 10 },
//   circle: { marginTop: 19, width: 12, height: 12, borderRadius: 6 },
//   line: { width: 2, flex: 1, minHeight: 50, backgroundColor: "#D3D3D3", marginVertical: 5 },
//   timelineItem: { flex: 1, padding: 15, borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   weekTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
//   description: { fontSize: 14, color: "#666", marginTop: 5 },
//   doneButton: { marginTop: 10, padding: 8, backgroundColor: "#ffffff", borderRadius: 8, alignItems: "center" },
//   doneButtonText: { color: "#000000", fontSize: 14, fontWeight: "bold" },
// });

// export default TimelineScreen;



// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   LayoutAnimation,
//   UIManager,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";

// if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const API_URL = "http://192.168.1.7:5000/get_appointments"; // Replace with actual backend URL

// const TimelineScreen = ({ navigation }) => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const response = await fetch(API_URL);
//         const data = await response.json();
//        console.log(data);
//         const formattedData = data.map((appointment) => ({
//           id: appointment.id,
//           title: appointment[0], // Title
//           description: appointment[1], // Description
//           date: appointment[2], // Date
//           time: appointment[3], // Time
//           location: appointment[4], // Location
//           status: appointment[5], // Status (pending/completed)
//         }));

//         // Sort by date
//         formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

//         setAppointments(formattedData);
//       } catch (error) {
//         console.error("Error fetching appointments:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, []);

//   const getAppointmentColor = (status) => {
//     return status === "completed" ? "#87CEFA" : "#FFC0CB"; // Blue for completed, Pink for pending
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="black" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Appointments</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#FF4081" style={{ marginTop: 50 }} />
//       ) : (
//         <FlatList
//           data={appointments}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={{ paddingBottom: 20 }}
//           renderItem={({ item, index }) => (
//             <View style={styles.timelineContainer}>
//               <View style={styles.timelineIndicator}>
//                 <View style={[styles.circle, { backgroundColor: getAppointmentColor(item.status) }]} />
//                 {index !== appointments.length - 1 && <View style={styles.line} />}
//               </View>

//               <View style={[styles.timelineItem, { backgroundColor: getAppointmentColor(item.status) }]}>
//                 <Text style={styles.title}>{item.title}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <Text style={styles.details}>📅 {item.date} | 🕒 {item.time}</Text>
//                 <Text style={styles.details}>📍 {item.location}</Text>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15 },
//   headerTitle: { fontSize: 18, fontWeight: "bold" },
//   timelineContainer: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 5 },
//   timelineIndicator: { alignItems: "center", marginRight: 10 },
//   circle: { marginTop: 19, width: 12, height: 12, borderRadius: 6 },
//   line: { width: 2, flex: 1, minHeight: 50, backgroundColor: "#D3D3D3", marginVertical: 5 },
//   timelineItem: { flex: 1, padding: 15, borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   title: { fontSize: 16, fontWeight: "bold", color: "#333" },
//   description: { fontSize: 14, color: "#666", marginTop: 5 },
//   details: { fontSize: 12, color: "#888", marginTop: 2 },
// });

// export default TimelineScreen;
