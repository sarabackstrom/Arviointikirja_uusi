import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { View, StyleSheet } from "react-native";
import { DataTable, PaperProvider, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
export default function App() {
  const [arvioinnit, setArvioinnit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const database = getDatabase();
    const studentsRef = ref(database, "kayttajat");

    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      const studentsList = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          const student = data[key];
          if (student.uid) {
            studentsList.push({
              uid: student.uid,
              name: student.kayttajanimi,
            });
          }
        });
      }
      setStudents(studentsList);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const database = getDatabase();
      const arvioinnitRef = ref(database, `kayttajat/${selectedStudent}/arvioinnit`);

      onValue(arvioinnitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arvioinnitArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          arvioinnitArray.sort((a, b) => new Date(a.liikuntatunti) - new Date(b.liikuntatunti));
          setArvioinnit(arvioinnitArray); 
        } else {
          setArvioinnit([]);
        }
        setLoading(false);
      });
    }
  }, [selectedStudent]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Valitse Oppilas</Text>
        <Picker
          selectedValue={selectedStudent}
          onValueChange={(itemValue) => {
            setSelectedStudent(itemValue);
            setLoading(true);
          }}
        >
          <Picker.Item label="Valitse oppilas" value={null} />
          {students.map((student) => (
            <Picker.Item key={student.uid} label={student.name} value={student.uid} />
          ))}
        </Picker>

        {selectedStudent && (
          <>
            <Text style={styles.title}>Arvostelut</Text>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.column}>Päivämäärä</DataTable.Title>
              <DataTable.Title style={styles.column}>Aihe</DataTable.Title>
                <DataTable.Title numeric style={styles.column}>Taidot</DataTable.Title>
                <DataTable.Title numeric style={styles.column}>Työskentely</DataTable.Title>
                <DataTable.Title style={styles.column}>Kommentti</DataTable.Title>
              </DataTable.Header>

              {arvioinnit.map((item) => (
                <DataTable.Row
                  key={item.id}
                  style={item.tekijaUid === "ope" ? styles.opeRow : {}}
                >
                  <DataTable.Cell style={styles.column}> {item.liikuntatunti ? `${item.liikuntatunti.paivamaara}` : "Ei valittu liikuntatuntia"}</DataTable.Cell>
                  <DataTable.Cell style={styles.column}> {item.liikuntatunti ? `${item.liikuntatunti.aihe}` : "Ei valittu liikuntatuntia"}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.column}>{item.taidot}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.column}>{item.tyoskentely}</DataTable.Cell>
                  <DataTable.Cell style={styles.column}>
                    <Text>{item.kommentti}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  opeRow: {
    backgroundColor: "#ADD8E6", // Vaaleansininen taustaväri opettajan arvosteluille
  },
});




