import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',               // Позволяет растягиваться до MAX_CONTENT_WIDTH (800px)
    paddingHorizontal: 16,
    paddingTop: 40,
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
    gap: 16,
  },
  avatarImage: {
    width: 174,
    height: 174,
    borderRadius: 100,
  },
  title: {
    textAlign: 'center',
    width: '100%',               // Убрали инлайновые ограничения maxWidth
  },
  subtitle: {
    textAlign: 'center',
    width: '100%',               // Убрали инлайновые ограничения maxWidth
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',           // Кнопка прижимается вниз по флекс-потоку без absolute
    marginBottom: 30,
  },
});
