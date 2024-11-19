import { useState, useEffect } from "react";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { getDatabase, ref, set, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";

export default function Oppitunti() {
  const database = getDatabase();
  const [luokka, setLuokka] = useState("");
  const [paivamaara, setPaivamaara] = useState("");
  const [aihe, setAihe] = useState("");
  const [kommentti, setKommentti] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [oppilaat, setOppilaat] = useState([]);

  useEffect(() => {
    const kayttajatRef = ref(database, "kayttajat");

    const unsubscribe = onValue(kayttajatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const oppilasLista = Object.entries(data)
          .filter(([key, kayttaja]) => kayttaja.luokka && kayttaja.luokka !== "opettaja")
          .map(([key, kayttaja]) => ({ uid: key, ...kayttaja }));
        setOppilaat(oppilasLista);
      } else {
        setOppilaat([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!luokka || !paivamaara || !aihe || !kommentti) {
      console.log("Kaikki kentät on täytettävä!");
      return;
    }
  
    const user = getAuth().currentUser; 
    if (user) {
      try {
        const oppituntiRef = ref(database, "oppitunnit"); 
        const newOppituntiRef = push(oppituntiRef);
        const oppituntiUid = newOppituntiRef.key
        await set(newOppituntiRef, {
          luokka: luokka,
          paivamaara: paivamaara,
          aihe: aihe,
          kommentti: kommentti,
          oppituntiUid: oppituntiUid,
        opettajaUid: user.uid,
        });
  
        console.log("Oppitunti lisätty tietokantaan");

        setAihe("");
        setKommentti("");
        setLuokka("");
        setPaivamaara("");
      } catch (error) {
        console.error("Virhe tallennuksessa:", error);
      }
    } else {
      console.log("Käyttäjä ei ole kirjautunut sisään");
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        label="Valitse luokka"
        value={luokka}
        mode="outlined"
        style={styles.input}
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={() => setPickerVisible(!pickerVisible)}
          />
        }
        editable={false}
      />
      {pickerVisible && (
        <Picker
          selectedValue={luokka}
          onValueChange={(value) => {
            setLuokka(value);
            setPickerVisible(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="7A" value="7A" />
          <Picker.Item label="7B" value="7B" />
          <Picker.Item label="7C" value="7C" />
        </Picker>
      )}

      <TextInput
        label="Aihe"
        value={aihe}
        onChangeText={setAihe}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Kommentti"
        value={kommentti}
        onChangeText={setKommentti}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Päivämäärä"
        value={paivamaara}
        onChangeText={setPaivamaara}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" style={styles.button} onPress={handleSubmit}>
        Lisää oppitunti
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5eeff",
    width: "90%",
    marginHorizontal: "5%",
  },
  input: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
  },
  picker: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
  },
  button: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
  },
});
