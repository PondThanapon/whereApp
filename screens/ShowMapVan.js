import React from "react"
Dimensions
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Keyboard,
  ScrollView
} from "react-native"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps" // remove PROVIDER_GOOGLE import if not using Google Maps
import { Marker } from "react-native-maps"
import BusStopIcon from "../components/BusStop"
import VanActive from "../components/VanActive"
import BusStopDetail from "../components/BusStopDetail"
import styled from "styled-components"
import {SettingApp} from '../appConfig';
import { AsyncStorage } from "react-native";
import moment from "moment";
import "moment/locale/th"; // without this line it didn't work
moment.locale("th");

export default class App extends React.Component {
  static navigationOptions = {
    title: "Van",
    gesturesEnabled: false,
  }

  state = {
    typing: false,
    searchTxt: "",
    openMenu: false,
    markers: [
      {
        title: "Your Location",
        description: "คุณอยู่ที่นี่"
      }
    ],
    open : false,
    User : '',
    region : {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    },
    latlng: {
      latitude: 0,////////// UpdateState Every 5 Sec
      longitude: 0
    },
    busStop: [],
    busLine: [],
    BusActive : [],
  }

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ User: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }
    await this.getLocation()
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()
    this.intervalID = setInterval(() => this.RefreshMaps(), 5000);
    
  }

  RefreshMaps = async () => {
    try {
      const value = await AsyncStorage.getItem("@region");
      if (value !== null) {
        await this.setState({ region: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }

    await this.fetchbusActiveData()
     console.log(" time: ",moment().format("HH:mm:ss"))
  };

  fetchData = async () => {
    let {searchTxt} = this.state
    

    if(searchTxt == ""){
      const response = await fetch(`${SettingApp}/busStop?searchText=${this.state.searchTxt}`)
      const busStop = await response.json()
      // console.log("busStop :::: ", busStop)
      await this.setState({ busStop })
    } else {
      const response = await fetch(`${SettingApp}/SearchBusStop?searchText=${this.state.searchTxt}`)
      const tempBusStop = await response.json()
      // console.log("tempBusStop :::: ", tempBusStop[1])
      const busStop = tempBusStop[1]
      await this.setState({ busStop })
    }



  }
//////////////////////////////////////////////
  fetchbusLineData = async () => {
    let {searchTxt} = this.state
    
    if(searchTxt == ""){
      const response = await fetch(`${SettingApp}/busLine?searchText=${this.state.searchTxt}`)
      const busLine = await response.json()
      // console.log("busLine :::: ", busLine)
      let BuslineTemp = []
      busLine.map(e => {
        BuslineTemp.push({ data : e, show : false})
      })
      await this.setState({ busLine : BuslineTemp })
    }
    else {
      const response = await fetch(`${SettingApp}/SearchBusStop?searchText=${this.state.searchTxt}`)
      const busLine = await response.json()
      // console.log("busLineSearch :::: ", busLine[0])
      let busLine2 = busLine[0]
      let BuslineTemp = []
      busLine2.map((e, key) => {
        BuslineTemp.push({ data : e, show : false})
      })
      await this.setState({ busLine : BuslineTemp })
    }
  }

  getLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        let latlng = {
          latitude: parseFloat(JSON.stringify(position.coords.latitude)),
          longitude: parseFloat(JSON.stringify(position.coords.longitude))
        }
        let region ={
          latitude: parseFloat(JSON.stringify(position.coords.latitude)),
          longitude: parseFloat(JSON.stringify(position.coords.longitude)),
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121
        }
        this.setState({ latlng , region  })
        // console.log("re :::: ",this.state.region)
      },
      error => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
    this.watchID = await navigator.geolocation.watchPosition(position => {
      let latlng = {
        latitude: parseFloat(JSON.stringify(position.coords.latitude)),
        longitude: parseFloat(JSON.stringify(position.coords.longitude))
      }
      let region ={
        latitude: parseFloat(JSON.stringify(position.coords.latitude)),
        longitude: parseFloat(JSON.stringify(position.coords.longitude)),
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121
      }
      this.setState({ latlng , region })
      // console.log("re :::: ",this.state.region)
    })
  }

  fetchbusActiveData = async () => {
    let {searchTxt, busLine} = this.state
    let lineQuery = []
    if(searchTxt == ""){ 
    const response = await fetch(`${SettingApp}/getVehicleActive?Vehicle_Type='Van'`)
    const BusActive = await response.json()
    // console.log("BusActive :::: ", BusActive)
    await this.setState({ BusActive})
    }else { 
      busLine.map(item => {
        lineQuery.push(item.data.busline_code)
      })
      const response = await fetch(`${SettingApp}/getVehicleActiveQuery?Vehicle_Type='Van'&lineQuery=${lineQuery}`)
      const BusActive = await response.json()
      await this.setState({ BusActive})
    }
  }

  
  componentWillUnmount = () => {
    clearInterval(this.intervalID);
    navigator.geolocation.clearWatch(this.watchID)
  }

  onOutFocus = async () => {
    Keyboard.dismiss()
    await this.setState({ typing: false, searchTxt : '' })
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()

  }

  onSearchSubmit = async () => {
    await this.setState({ typing: false })
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()

  }



  openDetail = (id) => {
    let { busLine } = this.state;
    const tempIndex = busLine.findIndex( e => {
        return e.data.busline_code == id
    });
    busLine[tempIndex].show = !busLine[tempIndex].show;
    this.setState({busLine});
}

  onRegionChangeComplete = async(region) => {
    console.log('onRegionChangeComplete ::: ', region);
    try {
      await AsyncStorage.setItem('@region', JSON.stringify(region));
    } catch (error) {
      console.log(error)
    }
  };

  openMenuFunc = async() => {
    try {
      const value = await AsyncStorage.getItem("@region");
      if (value !== null) {
        await this.setState({ region: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }
    this.setState({ openMenu: !this.state.openMenu })
  }



  render() {
    let {region, latlng} = this.state
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          onRegionChange={this.onRegionChangeComplete}
          region={this.state.region}
        >
         
          {this.state.busStop.map((marker, key) => {
            let LatLng = {
              latitude: parseFloat(marker.latitude),
              longitude: parseFloat(marker.longitude)
            }
            return (
              <Marker
                key={key}
                coordinate={LatLng}
                title={marker.busstop_name}
                description={marker.description}
              >
                <BusStopIcon textLine={marker.busline_name} />
              </Marker>
            )
          })}
          {this.state.BusActive.map((marker, key) => {
            let LatLng = {
              latitude: parseFloat(marker.lat) || 10000,
              longitude: parseFloat(marker.lon) || 10000
            }
            return (
              <Marker
                key={key}
                coordinate={LatLng}
                title={marker.busstop_name}
                description={marker.Vehicle_Name}
              >
                <VanActive textLine={marker.busline_code}  />
              </Marker>
            )
          })}
           <Marker
            coordinate={this.state.latlng}
            title={this.state.markers.title}
            description={this.state.markers.description}
          >
            <View>
              <Image
                source={require("../assets/icon/self-map-marker.png")}
                style={{ width: 70, height: 70, zIndex : 100 }}
              />
              {/* <Text>คุณอยู่ที่นี่</Text> */}
            </View>
          </Marker>
        </MapView>

        <MenuSlide
          openMenu={this.state.openMenu}
        >
         <TouchableOpacity style={{width : Dimensions.get("window").width}} onPress={() => this.setState({ openMenu: !this.state.openMenu })}>
            <TextMenuSlide openMenu={this.state.openMenu}>Van</TextMenuSlide>
         </TouchableOpacity>
          <TouchableOpacity style={styles.Line} onPress={() => this.setState({ openMenu: !this.state.openMenu })}/>
          <ScrollView >
            {this.state.busLine.map((item, key) => (
              // <View key={key}></View>
              <BusStopDetail key={key} data={item.data} show={item.show} openDetail={this.openDetail} />
            ))}
          </ScrollView>
        </MenuSlide>

{/* //////////////////////////////////////////////////////////////// */}

        <SearchTab typing={this.state.typing}>
          <Image
            source={require("../assets/icon/search.png")}
            style={{ width: 30, height: 30}}
            onPress={() => this.setState({ typing: false })}
          />

          {/* <KeyboardAwareScrollView styles={{}}> */}
          <TextInput
            placeholder="Where to ?"
            style={styles.InputStyle}
            onChangeText={searchTxt => this.setState({ searchTxt })}
            value={this.state.searchTxt}
            blurOnSubmit={true}
            onFocus={() => this.setState({ typing: true })}
            onSubmitEditing={() => this.onSearchSubmit()}
          />
          {/* </KeyboardAwareScrollView> */}

          {this.state.typing && (
            <TouchableOpacity onPress={() => this.onOutFocus()}>
              <Image
                source={require("../assets/icon/close.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          )}
        </SearchTab>

        {/* ///////////////////////////////////////////////////// */}
      </View>
    )
  }
}

let width = Dimensions.get("window").width
let height = Dimensions.get("window").height

const styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  Line: {
    width: 90,
    height: 6,
    backgroundColor: "rgb(71, 69, 245)",
    top: 0,
    position: "absolute",
    borderRadius: 50,
    marginTop: 10
  },
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
  LineFlex: {
   marginTop : 20,
    width: 300,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 50,
  },
  InputStyle: {
    marginTop: 20,
    paddingBottom: 20,
    fontSize: 30,
    width: 250,
    textAlign: "center",
    color: "rgb(29, 25, 204)"
  }
})

const MenuSlide = styled(View)`
  width: ${width};
  height: ${props => props.openMenu ? 500 : 150};
  position:absolute;
  top:${props => props.openMenu ? 250 : height-250};   
  backgroundColor: 'rgb(29,25,204)';
  borderRadius: 60;
  borderBottomEndRadius :  0;
  borderBottomStartRadius :  0;
  borderWidth: 0;
  justifyContent: flex-start;
  alignItems: center;
  paddingTop : 15;
  paddingBottom : 50;
`;

const SearchTab = styled(View)`
  width: ${width};
  height: 90;
  backgroundColor: white;
  borderRadius: 60;
  borderBottomEndRadius :  0;
  borderBottomStartRadius :  0;
  borderWidth: 0;
  justifyContent: center;
  alignItems: center;
  marginTop : ${height-180};
  marginBottom : ${props => props.typing ? 300 : 0}
  flexDirection: row;
`;

const TextMenuSlide = styled(Text)`
  fontSize: 30;
  color: 'rgb(101,102,251)';
  textAlign: center;
  paddingLeft: 10;
  paddingRight: 10;
  marginTop: 10;
`