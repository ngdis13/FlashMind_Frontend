import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',               // Тянется до MAX_CONTENT_WIDTH (800px)
    paddingHorizontal: 16,       // Аккуратные отступы по краям
    paddingTop: 40,              // Компенсация удаления SafeAreaView
  },
  progressLineBox: {
    width: '100%',               // Убрали maxWidth: 400
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    width: '100%',
    marginBottom: 24,
  },
  selectionFields: {
    width: '100%',               // Поля выбора теперь также растягиваются до 800px
    alignItems: 'center',
    gap: 24,
  },
});
