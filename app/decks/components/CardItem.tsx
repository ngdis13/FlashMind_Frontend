import { Typography } from "@/styles/Typography";
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Pressable } from "react-native";
import DeleteIcon from "@/assets/icons/DeleteIcon.png";
import { CustomAlert } from "./CustomAlert";

interface CardItemProps {
  card_id: string;
  front: string;
  onPress: (id: string) => void;
  onDelete: (id: string) => void; // Принимаем простую функцию
}

export const CardItem = ({ card_id, front, onPress, onDelete }: CardItemProps) => {
  const [alertVisible, setAlertVisible] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.clickableArea} 
        onPress={() => onPress(card_id)}
        activeOpacity={0.7}
      >
        <Typography variant="h2" numberOfLines={2} style={styles.text}>
          {front}
        </Typography>
      </TouchableOpacity>

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
          onDelete(card_id); // Вызываем удаление
        }}
        onCancel={() => setAlertVisible(false)}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#DBDBDB",
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clickableArea: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 50, 
  },
  text: {
    fontSize: 18,
  },
  deleteBtn: {
    position: 'absolute',
    right: 14,
    padding: 5,
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
});
