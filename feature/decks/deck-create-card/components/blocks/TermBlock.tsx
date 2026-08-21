import React from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import deleteIcon from '@/assets/icons/DeleteIcon.png'
import editIcon from '@/assets/icons/editIcon2.png'
import { commonStyles } from "@/styles/Common";
interface TermBlockProps {
  id: string;
  value: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const TermBlock: React.FC<TermBlockProps> = ({ value, onEdit, onDelete }) => {
  return (
    <View style={[styles.card, commonStyles.shadowBox]}>
      {/* Сиреневая шапка блока */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Иконка перетаскивания :: */}
          <Typography variant="h2" color={colors.white}>⋮⋮</Typography>
          <Typography variant="h2" color={colors.white}>Термин</Typography>
        </View>
        
        <View style={styles.headerActions}>
          {/* Кнопка Редактировать */}
          <Pressable onPress={onEdit} hitSlop={10}>
            <Image source={editIcon} style={{width: 27, height: 18}}/>
          </Pressable>
          {/* Кнопка Удалить */}
          <Pressable onPress={onDelete} hitSlop={10}>
            <Image source={deleteIcon} style={{width: 18, height: 18}}/>
          </Pressable>
        </View>
      </View>

      {/* Область контента */}
      <View style={styles.content}>
        <Typography 
          variant="h3" 
          style={value ? styles.text : styles.placeholder}
        >
          {value || "Нажмите на карандаш, чтобы редактировать..."}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden", 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.mainColor , 
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  content: {
    padding: 16,
    minHeight: 50,
    justifyContent: "center",
  },
  text: {
    color: colors.darkGray ,
  },
  placeholder: {
    color: colors.darkGray,
    fontStyle: "italic",
  },
});
