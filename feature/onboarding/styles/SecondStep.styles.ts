import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',               // Позволяет внутренностям растягиваться до 800px родительского container
    paddingHorizontal: 16,       // Отступы по бокам для адаптивности на мобильных
    paddingTop: 40,              // Отступ сверху вместо SafeAreaView
  },
  progressLineBox: {
    width: '100%',               // Убрали maxWidth: 400, теперь линия тянется на всю ширину контента
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',               // Контейнер контента занимает всю ширину
    gap: 40,
  },
  title: {
    textAlign: 'center',
    width: '100%',               // Убрали maxWidth: 400, заголовок адаптируется под ширину 800px
  },
  buttonContainer: {
    width: '100%',               // Кнопка растягивается по ширине экрана/контейнера
    marginTop: 'auto',           // Выталкивает кнопку вниз, сохраняя флекс-поток без absolute
    marginBottom: 30,            // Безопасный отступ от нижнего края экрана
  },
});
