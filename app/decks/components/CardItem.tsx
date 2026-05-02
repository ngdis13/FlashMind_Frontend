import { Typography } from "@/styles/Typography";
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Pressable } from "react-native";
import DeleteIcon from "@/assets/icons/DeleteIcon.png";
import { CustomAlert } from "./CustomAlert";

interface CardItemProps {
  card_id: string;
  front: string;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CardItem = ({ card_id, front, onPress, onDelete }: CardItemProps) => {
  const [alertVisible, setAlertVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Вся карточка — это кнопка перехода */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress(card_id)} 
        activeOpacity={0.7}
      >
        <Typography variant="h2" numberOfLines={2}>
          {front}
        </Typography>
      </TouchableOpacity>

      {/* Кнопка удаления абсолютно прижата к правому краю */}
      <Pressable 
        style={styles.deleteBtn} 
        onPress={() => setAlertVisible(true)}
        hitSlop={15}
      >
        <Image source={DeleteIcon} style={styles.deleteIcon} />
      </Pressable>

      <CustomAlert
        visible={alertVisible}
        message="Ты действительно хочешь удалить карточку?"
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={() => {
          setAlertVisible(false);
          onDelete(card_id);
        }}
        onCancel={() => setAlertVisible(false)}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
    justifyContent: 'center',
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#DBDBDB",
    paddingVertical: 18,
    paddingLeft: 14,
    paddingRight: 50, // Отступ справа, чтобы текст не залез под корзину
    minHeight: 64,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteBtn: {
    position: "absolute",
    right: 14,
    zIndex: 10,
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
});
