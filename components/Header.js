import React from "react";
import { Text, TouchableOpacity, View, Image, StyleSheet } from "react-native";

export default function BusStopIcon(props) {
  return (
    <View>
      <TouchableOpacity>
            <Image
              style={styles.MenuStyle}
              source={require("../assets/icon/menu.png")}
            />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  TextIcon: {
    width: 30,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    color: "rgb(29, 25, 204)",
    position: "absolute",
    top: 11,
    left: 10,
    borderWidth: 1
  }
});
