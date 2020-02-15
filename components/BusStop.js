import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import styled from "styled-components"

export default function BusStopIcon(props) {
  return (
    <>
      <Icon>
        <TextIcon>{props.textLine}</TextIcon>
      </Icon>
      <Line />
    </>
  )
}

const Icon = styled(TouchableOpacity)`
  width: 35;
  height: 35;
  backgroundColor: pink;
  borderRadius: 10;
  justifyContent: center;
  alignItems: center;
`
const TextIcon = styled(Text)`
  color: "rgb(29, 25, 204)";
`

const Line = styled(View)`
  position : absolute;
  bottom : -15;
  left : 15;
  z-index : -1;
  width: 5;
  height: 20;
  borderRadius: 10;
  backgroundColor: "rgb(29, 25, 204)";
`
