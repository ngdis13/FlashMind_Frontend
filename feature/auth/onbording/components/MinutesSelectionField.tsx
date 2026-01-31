import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import { Typography } from '@/styles/Typography';
import { colors } from '@/styles/Colors';

interface MinutesSelectionFieldProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export const MinutesSelectionField = ({
  initialValue = 20,
  min = 5,
  max = 1440,
  onChange,
}: MinutesSelectionFieldProps) => {
  const [value, setValue] = useState(initialValue.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const getNumericValue = () => {
    const num = Number(value);
    return isNaN(num) ? initialValue : num;
  };

  const applyValue = (newValue: number) => {
    const clamped = Math.min(Math.max(newValue, min), max);
    setValue(clamped.toString());
    onChange?.(clamped);
  };

  const blurInput = () => {
    inputRef.current?.blur();
  };

  const handleMinus = () => {
    blurInput();
    applyValue(getNumericValue() - 5);
  };

  const handlePlus = () => {
    blurInput();
    applyValue(getNumericValue() + 5);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.control} onPress={handleMinus}>
        <Typography variant="h1">−</Typography>
      </TouchableOpacity>

      <Pressable
        style={styles.minutes}
        onPress={() => inputRef.current?.focus()}
      >
        <Typography
          variant="h1"
          style={[
            styles.valueText,
            isFocused && styles.valueTextFocused,
          ]}
        >
          {value || min}
        </Typography>
      </Pressable>

      <TouchableOpacity style={styles.control} onPress={handlePlus}>
        <Typography variant="h1">+</Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: colors.mainColor,
    borderWidth: 2,

    height: 56,
    width: '100%',
    maxWidth: 375,
    paddingHorizontal: 10,
  },

  control: {
    width: 33,
    height: 33,
    borderRadius: 20,
    backgroundColor: colors.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  minutes: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 300,
  },

  valueText: {
    color: '#9A9A9A',
  },

  valueTextFocused: {
    color: '#4A4A4A',
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});
