import { useState } from "react";
import { SafeAreaView, StyleSheet, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";

import { handleSignIn, handleSignUp } from "./Authentication";

import { getDatabase, ref, set } from "firebase/database";
import { app } from "./Authentication";

export default function Kirjautumisivu({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uusiemail, setuusiEmail] = useState("");
  const [uusipassword, setuusiPassword] = useState("");
  const [kayttajatunnus, setKayttajatunnus] = useState("");
  const [luokka, setLuokka] = useState("");

  const database = getDatabase(app);

  const handleRegister = async () => {
    try {
      const userCredential = await handleSignUp(uusiemail, uusipassword);
      const user = userCredential.user;

      await set(ref(database, "kayttajat/" + user.uid), {
        uid: user.uid,
        email: user.email,
        kayttajanimi: kayttajatunnus,
        luokka: luokka,
        arvioinnit: ["Esimerkki arviointi"]
      });

      console.log("Käyttäjä tallennettu tietokantaan",

        setKayttajatunnus(""),
        setuusiEmail(""),
        setLuokka(""),
        setuusiPassword("")

      );

      Alert.alert(
        "Tunnus luotu",
        `Tunnus ${kayttajatunnus} luotu sähköpostille ${uusiemail}.`,
        [
          {
            text: "OK",
            onPress: () => console.log("Alert OK pressed"),
          },
        ]
      );
    } catch (error) {
      console.error("Error during sign-up:", error.message);
      Alert.alert("Virhe", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await handleSignIn(email, password);
      onLogin();
    } catch (error) {
      console.error("Error during login:", error.message);
      Alert.alert("Virhe kirjautumisessa", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Kirjaudu sisään
      </Button>
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Luo tunnus
      </Button>
      <TextInput
        label="Käyttäjätunnus (Etu- ja Sukunimi)"
        value={kayttajatunnus}
        onChangeText={setKayttajatunnus}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={uusiemail}
        onChangeText={setuusiEmail}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Luokka"
        value={luokka}
        onChangeText={setLuokka}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={uusipassword}
        onChangeText={setuusiPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
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
  },
  button: {
    marginBottom: 10,
  },
});



