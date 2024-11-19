import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import Kirjautumisivu from "./components/Kirjautumissivu";
import Arviointilomake from "./components/Arviointilomake";
import { handleLogout } from "./components/Authentication";
import ArviointilomakeOpe from "./components/ArviointilomakeOpe";
import Oppitunti from "./components/Oppitunti";
import OppilaanArvostelunakyma from "./components/OppilaanArvostelunakyma.js";
import Arvostelut from "./components/Arvostelut.js";

const Drawer = createDrawerNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLuokka, setUserLuokka] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);

        // Hae käyttäjän luokka tietokannasta
        const database = getDatabase();
        const userRef = ref(database, `kayttajat/${user.uid}/luokka`);

        onValue(userRef, (snapshot) => {
          const luokka = snapshot.val();
          setUserLuokka(luokka);
          setLoading(false);
        });
      } else {
        setIsAuthenticated(false);
        setUserLuokka(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName={isAuthenticated ? (userLuokka === "ope" ? "Arviointikirja" : "Arvioinnit") : "Kirjautuminen"}>
        {/* Näytetään kirjautumissivu, jos käyttäjä ei ole kirjautunut */}
        {!isAuthenticated && (
          <Drawer.Screen name="Kirjautuminen">
            {({ navigation }) => (
              <Kirjautumisivu
                onLogin={() => setIsAuthenticated(true)} // Käyttäjän kirjautuminen
              />
            )}
          </Drawer.Screen>
        )}

        {/* Näytetään opettajan tai oppilaan lomake käyttäjän luokan mukaan */}
        {isAuthenticated && userLuokka === "ope" && (
          <>
          <Drawer.Screen name="Arviointikirja" component={Arvostelut} />
            <Drawer.Screen name="Opettajan arviointilomake" component={ArviointilomakeOpe} />
            <Drawer.Screen name="Lisää oppitunti" component={Oppitunti} />
          </>
        )}

        {isAuthenticated && userLuokka !== "ope" && (
          <>
          <Drawer.Screen name="Arvioinnit" component={OppilaanArvostelunakyma} />
            <Drawer.Screen name="Oppilaan arviointilomake" component={Arviointilomake} />
            
          </>
        )}

        {/* Kirjaudu ulos */}
        {isAuthenticated && (
          <Drawer.Screen name="Kirjaudu ulos">
            {({ navigation }) => (
              <View style={styles.logoutContainer}>
                <Button
                  mode="contained"
                  onPress={() => {
                    handleLogout();
                    setIsAuthenticated(false);
                    setUserLuokka(null);
                  }}
                >
                  Kirjaudu ulos
                </Button>
              </View>
            )}
          </Drawer.Screen>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});