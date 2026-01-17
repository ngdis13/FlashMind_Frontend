import React, { useState, useRef } from 'react';
import { Pressable, TextInput, View, StyleSheet } from 'react-native';
import { Typography } from '@/styles';

type CodeInputProps = {
  length?: number;
  onCodeFilled?: (code: string) => void;
};

export const CodeInput = ({
  length = 6,
  onCodeFilled,
}: CodeInputProps) => {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleChange = (value: string) => {
    const sanitazed = value.replace(/[^0-9]/g, '').slice(0, length);
    setCode(sanitazed);
    if (sanitazed.length === length && onCodeFilled) {
      onCodeFilled(sanitazed);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoFocus
      />

      {Array.from({ length }).map((_, i) => {
        const char = code[i] ?? '';
        const isActive = i === code.length;
        return (
          <View
            key={i}
            style={[styles.box, isActive && styles.activeBox]}
          >
            <Typography variant="h2">{char}</Typography>
          </View>
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  box: {
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  activeBox: {
    borderColor: '#6E75D9',
  },
  char: {
    fontSize: 22,
    fontWeight: '600',
  },
});
