import React from "react";
import { Text, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import styled from "styled-components";
import { BorderlessButton } from "react-native-gesture-handler";

export default function BusStopIcon(props) {
  return (
    <>
      <Image
        source={require("../assets/icon/truckMarker_breakdown.png")}
        style={{ width: 50, height: 50, marginEnd: 20, zIndex:80 }}
      />
      <Text style={styles.TextIcon}>{props.textLine}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  TextIcon: {
    width : 30,
    fontSize : 12,
    fontWeight:'900',
    textAlign : "center",
    color: "rgb(29, 25, 204)",
    position: "absolute",
    top: 13,
    left : 10,
  }
});
