import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestionCard = ({ question, options, selectedOption, onSelect, disabled }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                disabled && styles.disabledOption,
              ]}
              onPress={() => !disabled && onSelect(index)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIndicator, isSelected && styles.selectedIndicator]}>
                  <Text style={[styles.optionLetter, isSelected && styles.selectedLetter]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                ]}>
                  {option}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#252525',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  selectedOption: {
    borderColor: '#4ECDC4',
    backgroundColor: '#1A2A2A',
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIndicator: {
    backgroundColor: '#4ECDC4',
  },
  optionLetter: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedLetter: {
    color: '#000',
  },
  optionText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default QuestionCard;
