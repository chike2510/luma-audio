import { useRef, type ReactNode } from "react";
import { Animated, Platform, Pressable, StyleSheet, type PressableProps, type ViewStyle } from "react-native";

export function MotionCard({ children, onPress, style }: { children: ReactNode; onPress?: PressableProps["onPress"]; style?: ViewStyle }) {
  const motion = useRef(new Animated.Value(0)).current;
  const animate = (value: number) => Animated.timing(motion, { toValue: value, duration: value ? 180 : 140, useNativeDriver: true }).start();
  const translateY = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });
  const scale = motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.004] });
  return <Pressable onPress={onPress} onPressIn={() => animate(Platform.OS === "web" ? 1 : 0.55)} onPressOut={() => animate(0)} onHoverIn={() => Platform.OS === "web" && animate(1)} onHoverOut={() => Platform.OS === "web" && animate(0)} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
    <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]}>{children}</Animated.View>
  </Pressable>;
}

const styles = StyleSheet.create({ pressable: { borderRadius: 9 }, pressed: { opacity: 0.76 }, });
