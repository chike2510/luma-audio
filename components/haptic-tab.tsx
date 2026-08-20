import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return <PlatformPressable
    {...props}
    onHoverIn={() => setHovered(true)}
    onHoverOut={() => setHovered(false)}
    onPressIn={(ev) => {
      setPressed(true);
      if (process.env.EXPO_OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      props.onPressIn?.(ev);
    }}
    onPressOut={(ev) => {
      setPressed(false);
      props.onPressOut?.(ev);
    }}
    style={[props.style, hovered && Platform.OS === "web" ? styles.hovered : null, pressed ? styles.pressed : null]}
  />;
}

const styles = StyleSheet.create({ hovered: { backgroundColor: "#111A31", borderRadius: 12, transform: [{ translateY: -1 }] }, pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] } });
