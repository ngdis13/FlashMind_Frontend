import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, ScrollView, View } from "react-native";
import { styles } from "../styles/mainDecks.styles";
import { Input } from "@/components/Input";
import { useState } from "react";
import { Image } from "react-native";
import searchButton from "../assets/searchButton.png";
import { MainButton } from "@/components/MainButton";
import DecksView from "../components/DecksView";

export default function MainDecksScreen() {
  const [search, setSearch] = useState("");
  const startSearch = () => {
    /**здесь будет поиск */
  };
  const handleEditDecks = () => {
    
  }
  const handleAddDecks = () => {};
  return (
    <View style={[commonStyles.container]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between", // Толкает элементы друг от друга
          paddingBottom: 20, // Небольшой отступ снизу для красоты
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.mainContent}>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Мои колоды
          </Typography>

          <View style={styles.searchBox}>
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Поиск"}
              autoCapitalize="none"
              value={search}
              onChangeText={(text) => setSearch(text)}
            />
            <Pressable onPress={startSearch} style={styles.searchButton}>
              <Image
                source={searchButton}
                style={{ width: 18, height: 18 }}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          <View> 
            <DecksView title={"Дискретная математика"} cardCount={65} cardCountNow={23} onEditPress={handleEditDecks}/>
          </View>
        </View>
      </ScrollView>
      <MainButton
        style={styles.addDecksButton}
        title="Добавить колоду"
        onPress={handleAddDecks}
      />
    </View>
  );
}
