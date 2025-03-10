import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
  Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { countries } from "../data/countries";


export default function BasicDetailsScreen() {
  const navigation = useNavigation();

  // State for user inputs
  const [country, setCountry] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Validate inputs
  const handleContinue = () => {
    let newErrors = {};

    if (!country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.replace("MainTabs");
    }
  };

  const handleSelectCountry = (selectedCountry) => {
    setCountry(selectedCountry);
    setShowCountryModal(false);
    setErrors((prev) => ({ ...prev, country: "" }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Details</Text>

      {/* Country Name Input */}
      <Text style={styles.title1}>Select Country</Text>
      <TouchableOpacity 
        style={[styles.input, errors.country ? styles.errorBorder : null]} 
        onPress={() => setShowCountryModal(true)}
      >
        <View style={styles.inputContainer}>
          <Text style={country ? styles.inputText : styles.placeholderText}>
            {country || "Select Your Country"}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </View>
      </TouchableOpacity>
      {errors.country ? <Text style={styles.errorText}>{errors.country}</Text> : null}
      
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Country</Text>
            <FlatList
              data={countries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Text style={styles.countryText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Calendar */}
      <Text style={styles.title1}>Select your Due Date</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: "#ff4081" } }}
          theme={{
            todayTextColor: "#ff4081",
            arrowColor: "#ff4081",
          }}
        />
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
          We are collecting this information solely to provide accurate AI-generated insights based on your pregnancy duration.
      </Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    
  },
  title1: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    placeholderTextColor: "#fff",
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#999",
  },
  inputText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  countryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  countryText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#ff4081",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  disclaimer: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff4081",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarContainer: { 
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginBottom: 20
   },
});


