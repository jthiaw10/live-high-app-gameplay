/**
 * App.tsx — Blaze Runner root.
 *
 * Replaces the old single-screen navigation stack with a simple
 * scene state machine. Each "scene" is a full-screen React tree.
 * Transitions are instant unless the scene itself animates them.
 *
 * Scene flow:
 *   loading → menu → intro → game → (intro → game)* → victory
 *   game → pause (modal inside game)
 *   game → gameOver
 *   menu → settings / credits → menu
 *
 * Cross-level state (level index, lives, score, high score) lives
 * here so that GameScreen stays stateless between runs and simply
 * reports results via callbacks.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoadingScreen from './screens/LoadingScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import LevelIntroScreen from './screens/LevelIntroScreen';
import GameScreen, { LevelResult } from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import VictoryScreen from './screens/VictoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreditsScreen from './screens/CreditsScreen';

import { LEVELS, getLevel, isLastLevel } from './lib/levels';
import { GAME_CONFIG } from './config/constants';
import { audio } from './lib/audio';

type Scene =
  | 'loading'
  | 'menu'
  | 'settings'
  | 'credits'
  | 'intro'
  | 'game'
  | 'gameOver'
  | 'victory';

interface RunState {
  levelIndex: number;
  lives: number;
  score: number;
}

const INITIAL_RUN: RunState = {
  levelIndex: 0,
  lives: GAME_CONFIG.STARTING_LIVES,
  score: 0,
};

export default function App() {
  const [scene, setScene] = useState<Scene>('loading');
  const [run, setRun] = useState<RunState>(INITIAL_RUN);
  const [highScore, setHighScore] = useState<number>(0);

  const goMenu = useCallback(() => setScene('menu'), []);
  const startGame = useCallback(() => {
    audio.ensureReady();
    setRun(INITIAL_RUN);
    setScene('intro');
  }, []);

  const handleIntroContinue = useCallback(() => {
    setScene('game');
  }, []);

  const handleLevelComplete = useCallback(
    (result: LevelResult) => {
      setRun((prev) => {
        const newScore = prev.score + result.exp + result.bonus;
        const newLives = result.livesRemaining;
        if (isLastLevel(prev.levelIndex)) {
          if (newScore > highScore) setHighScore(newScore);
          setScene('victory');
          return { ...prev, score: newScore, lives: newLives };
        }
        setScene('intro');
        return {
          ...prev,
          score: newScore,
          lives: newLives,
          levelIndex: prev.levelIndex + 1,
        };
      });
    },
    [highScore]
  );

  const handleLifeLost = useCallback((livesRemaining: number) => {
    setRun((prev) => ({ ...prev, lives: livesRemaining }));
  }, []);

  const handleOutOfLives = useCallback(() => {
    setRun((prev) => {
      if (prev.score > highScore) setHighScore(prev.score);
      return prev;
    });
    setScene('gameOver');
  }, [highScore]);

  const handleQuitToMenu = useCallback(() => {
    setRun((prev) => {
      if (prev.score > highScore) setHighScore(prev.score);
      return prev;
    });
    setScene('menu');
  }, [highScore]);

  // Scene dispatch
  let content: React.ReactNode = null;
  switch (scene) {
    case 'loading':
      content = <LoadingScreen onDone={goMenu} />;
      break;

    case 'menu':
      content = (
        <MainMenuScreen
          onPlay={startGame}
          onSettings={() => setScene('settings')}
          onCredits={() => setScene('credits')}
          highScore={highScore}
        />
      );
      break;

    case 'settings':
      content = <SettingsScreen onBack={goMenu} />;
      break;

    case 'credits':
      content = <CreditsScreen onBack={goMenu} />;
      break;

    case 'intro': {
      const level = getLevel(run.levelIndex);
      content = (
        <LevelIntroScreen
          levelNumber={run.levelIndex + 1}
          levelName={level.name}
          tagline={level.tagline}
          livesRemaining={run.lives}
          runningScore={run.score}
          onContinue={handleIntroContinue}
        />
      );
      break;
    }

    case 'game':
      content = (
        <GameScreen
          key={`level-${run.levelIndex}`}
          levelIndex={run.levelIndex}
          livesRemaining={run.lives}
          runningScore={run.score}
          onLevelComplete={handleLevelComplete}
          onLifeLost={handleLifeLost}
          onOutOfLives={handleOutOfLives}
          onQuitToMenu={handleQuitToMenu}
        />
      );
      break;

    case 'gameOver':
      content = (
        <GameOverScreen
          finalScore={run.score}
          onRetry={startGame}
          onMenu={goMenu}
        />
      );
      break;

    case 'victory':
      content = (
        <VictoryScreen
          finalScore={run.score}
          livesRemaining={run.lives}
          onPlayAgain={startGame}
          onMenu={goMenu}
        />
      );
      break;
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.container}>{content}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
