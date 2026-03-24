import { colors } from '@/styles/Colors';
import { Typography } from '@/styles/Typography';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface DecksViewProps {
    title: string;
    cardCount: number;
    cardCountNow: number;
    onEditPress: () => void;
}

export default function DecksView({title, cardCount, cardCountNow, onEditPress}: DecksViewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Typography variant='h2'>{title}</Typography>
        <View style={styles.countsContainer}>
          <View style={styles.countBadge}>
            <Typography variant='h2' style={styles.countText}>{cardCount}</Typography>
          </View>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.extraCountText}>{cardCountNow}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    maxWidth: 182,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 28,
    paddingHorizontal: 8,
    borderColor: colors.lightGray,
    borderWidth: 2
  },
  content: {
    flex: 1,
  },
  title: {

  },
  countsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    fontFamily: 'MontserratMedium',
    fontWeight: '500',
    color: '#6E75D9',
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#CCCCCC',
  },
  extraCountText: {
    fontSize: 14,
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    color: '#888888',
  },
  editButton: {
    padding: 8,
    marginLeft: 12,
  },
  editIcon: {
    fontSize: 20,
  },
});