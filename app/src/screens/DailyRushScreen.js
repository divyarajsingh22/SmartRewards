import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { startDailyRush, finishDailyRush, login, getProfile } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import TimerBar from '../components/TimerBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const QUESTION_TIME = 9;

const DailyRushScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeUser = route?.params?.user;
  const effectiveUser = user || routeUser;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [answers, setAnswers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const questionStartTime = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (effectiveUser && effectiveUser._id) {
      loadGame(effectiveUser);
    } else {
      (async () => {
        const saved = await AsyncStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed._id) {
            setUser && setUser(parsed);
            loadGame(parsed);
            return;
          }
        }
        Alert.alert('Login Required', 'Please login first', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      })();
    }
  }, [user, routeUser]);

  useEffect(() => {
    if (gameStarted && questions.length > 0 && currentQuestionIndex < questions.length) {
      startQuestion();
    }
  }, [currentQuestionIndex, gameStarted]);

  const loadGame = async (effectiveUser) => {
    try {
      const uid = effectiveUser ? effectiveUser._id : (user && user._id);
      if (!uid) {
        throw new Error('user id missing');
      }
      const response = await startDailyRush(uid);
      if (response.error) {
        setLoading(false);
        setErrorMsg(response.error);
        Alert.alert('Error', response.error, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      setQuestions(response.questions);
      setGameStarted(true);
      setLoading(false);
    } catch (error) {
      console.error('DailyRush loadGame error:', error);
      setLoading(false);
      setErrorMsg(error.message || 'Failed to start game');
      Alert.alert('Error', error.message || 'Failed to start game', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleRetry = async () => {
    setErrorMsg(null);
    setLoading(true);
    const effectiveUser = user || routeUser;
    if (effectiveUser && effectiveUser._id) {
      await loadGame(effectiveUser);
      return;
    }
    try {
      const saved = await AsyncStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed._id) {
          setUser && setUser(parsed);
          await loadGame(parsed);
          return;
        }
      }
    } catch (err) {
      console.error('Retry load user error:', err);
    }
    setLoading(false);
    setErrorMsg('Login required to start game');
  };

  const startQuestion = () => {
    questionStartTime.current = Date.now();
    setTimerActive(true);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectOption = (optionIndex) => {
    if (selectedOptions[currentQuestionIndex] !== undefined) return;

    const timeElapsed = (Date.now() - questionStartTime.current) / 1000;
    const timeRemaining = Math.max(0, QUESTION_TIME - timeElapsed);

    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));

    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: optionIndex,
        timeRemaining,
      },
    ]);

    setTimeout(() => {
      moveToNextQuestion();
    }, 500);
  };

  const handleTimerComplete = () => {
    if (selectedOptions[currentQuestionIndex] === undefined) {
      const timeRemaining = 0;
      const currentQuestion = questions[currentQuestionIndex];
      setSelectedOptions((prev) => ({
        ...prev,
        [currentQuestionIndex]: -1,
      }));
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedOption: -1,
          timeRemaining,
        },
      ]);

      setTimeout(() => {
        moveToNextQuestion();
      }, 500);
    }
  };

  const moveToNextQuestion = () => {
    setTimerActive(false);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishGameSession();
    }
  };

  const finishGameSession = async () => {
    try {
      const effectiveUser = user || routeUser;
      const uid = effectiveUser ? effectiveUser._id : (user && user._id);
      if (!uid) throw new Error('user id missing');
      const response = await finishDailyRush(uid, answers);
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      // Try to fetch updated profile from server so UI shows accurate tokens/streak
      try {
        const profileResp = await getProfile(uid);
        const freshUser = profileResp && profileResp.user ? profileResp.user : null;
        if (freshUser) {
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
          setUser && setUser(freshUser);
        }
        navigation.replace('ResultScreen', { result: response, user: freshUser || effectiveUser });
        return;
      } catch (err) {
        console.error('Failed to refresh profile after finish:', err);
        // Fallback: update local stored user tokens/streak if present
        const updatedUser = await AsyncStorage.getItem('user');
        if (updatedUser) {
          const parsed = JSON.parse(updatedUser);
          parsed.tokens = (parsed.tokens || 0) + response.tokensEarned;
          parsed.streak = response.streak;
          await AsyncStorage.setItem('user', JSON.stringify(parsed));
          setUser && setUser(parsed);
          navigation.replace('ResultScreen', { result: response, user: parsed });
          return;
        }
        navigation.replace('ResultScreen', { result: response, user: effectiveUser });
        return;
      }
    } catch (error) {
      console.error('finishGameSession error:', error);
      Alert.alert('Error', 'Failed to finish game');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <Text style={styles.loadingText}>No questions available</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          {errorMsg ? (
            <View style={styles.errorBannerInline}>
              <Text style={styles.errorTextInline}>{errorMsg}</Text>
              <View style={styles.errorActionsInline}>
                <TouchableOpacity onPress={handleRetry} style={styles.retrySmall}>
                  <Text style={styles.retryTextSmall}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.closeSmall}>
                  <Text style={styles.closeTextSmall}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        {errorMsg ? (
          <View style={styles.errorBannerInline}>
            <Text style={styles.errorTextInline}>{errorMsg}</Text>
            <View style={styles.errorActionsInline}>
              <TouchableOpacity onPress={handleRetry} style={styles.retrySmall}>
                <Text style={styles.retryTextSmall}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.closeSmall}>
                <Text style={styles.closeTextSmall}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <TimerBar
          duration={QUESTION_TIME}
          onComplete={handleTimerComplete}
          isActive={timerActive}
        />

        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedOption={selectedOptions[currentQuestionIndex]}
          onSelect={handleSelectOption}
          disabled={selectedOptions[currentQuestionIndex] !== undefined}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#FFB800',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },
  debugPanel: {
    backgroundColor: '#111',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugText: {
    color: '#888',
    fontSize: 12,
  },
  debugError: {
    color: '#ffb3b3',
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: '#3b1f1f',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#5a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffd6d6',
    flex: 1,
    marginRight: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    color: '#ffd6d6',
  },
  errorBannerInline: {
    backgroundColor: '#2b1a1a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorTextInline: {
    color: '#ffcccc',
    flex: 1,
    marginRight: 8,
  },
  errorActionsInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retrySmall: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  retryTextSmall: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  closeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeTextSmall: {
    color: '#ffcccc',
    fontWeight: '700',
  },
});

export default DailyRushScreen;
