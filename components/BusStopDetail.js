import React from "react"
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native"
import styled from "styled-components"
import {SettingApp} from '../appConfig';

export default class BusStopDetail extends React.Component {
  state = {
    show: false,
    busStop : []
  }


  fetchData = async () => {
    await this.setState({ busStop : [] })
    const response = await fetch(`${SettingApp}/busStop?busline_name=${this.props.data.busline_name}`)
    const busStop = await response.json()
    // console.log("busStop :::: ", busStop)
    await this.setState({ busStop })
  }

  componentDidMount = async () => {
    await this.fetchData()
  }

  componentWillReceiveProps = async () => {
    await this.fetchData()
  }

  render() {
    return (

      <View >
      <TouchableOpacity style={styles.ViewFlex} onPress={() => this.props.openDetail(this.props.data.busline_code)} id={this.props.data.busline_code}  >
        <Image
          source={require("../assets/icon/bus.png")}
          style={{ width: 50, height: 50, marginEnd : 20  }}
        />
        <View>
          <Text style={{fontSize:30, color : 'white'}}>สาย {this.props.data.busline_name}</Text>
          <Text  style={{fontSize:15, color : 'grey'}}>{this.props.data.busline_detail}</Text>
        </View>
      </TouchableOpacity>

      <Container show={this.props.show}>
        {this.state.busStop.map((item, key) => (
          <Flex key={key}>
            <Image
              source={
                key == 0
                  ? require("../assets/icon/lineCircleStart.png")
                  : key == this.state.busStop.length - 1
                  ? require("../assets/icon/lineCircleEnd.png")
                  : require("../assets/icon/lineCircle.png")
              }
              style={{ marginEnd: 10 }}
            />

            <TextIcon
              numberOfLines={1}
              marginTop={key == 0 ? 0 : 20}
              marginBottom={key == this.state.busStop.length - 1 ? 50 : 0}
            >
              {item.busstop_name}
            </TextIcon>
          </Flex>
        ))}
      </Container>
    </View >



      
    )
  }
}

let width = Dimensions.get("window").width


const styles = StyleSheet.create({
  ViewFlex: {
    width : width-70,
    flexDirection: "row",
    paddingTop : 20,
    paddingBottom : 20,
    marginStart :30,
    marginEnd : 30,
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomWidth : 1,
    borderBottomColor : 'rgba(255,255,255,0.5)',
  },
})



const Container = styled(ScrollView)`
  display : ${props => props.show ? 'flex' : 'none' }
  width: ${width};
  backgroundColor: white;
  paddingStart: 30;
  paddingEnd 30;
  paddingTop: 30;
`
const Flex = styled(View)`
  flexDirection: row;
`

const TextIcon = styled(Text)`
  color: "rgb(29, 25, 204)";
  fontSize : 20;
  marginTop : ${props => props.marginTop};
  marginBottom : ${props => props.marginBottom};
`
