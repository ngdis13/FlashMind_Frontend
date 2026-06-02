import { colors } from "@/styles/Colors";
import { StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  firstHeader: {
    textTransform: "uppercase",
    color: colors.darkGray,
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  underlineInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#DBDBDB",
    paddingBottom: 8, // Используем только нижний отступ, чтобы линия была ровно под текстом
  },
  multilineInput: {
  },
  updateCardButton: {
    marginLeft: 10,
    marginRight: 10,
    alignSelf: "center",
  },
});
