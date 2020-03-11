
import React from "react";
import {
  Component,
  PropTypes,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Button,
  Alert,
  AsyncStorage,
  Dimensions,
  TextInput,
  Keyboard,
} from "react-native";

import Drawer from "react-native-drawer";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps" // remove PROVIDER_GOOGLE import if not using Google Maps
import { Marker } from "react-native-maps"
import BusStopIcon from "../components/BusStop"
import BusActive from "../components/BusActive"
import VanBreakDown from "../components/VanBreakDown"
import BoatBreakDown from "../components/BoatBreakDown"
import TruckBreakDown from "../components/TruckBreakDown"
import BusBreakDown from "../components/BusBreakDown"
import TruckActive from "../components/TruckActive"
import VanActive from "../components/VanActive"
import BoatActive from "../components/BoatActive"
import BusStopDetail from "../components/BusStopDetail"
import styled from "styled-components"
import {SettingApp} from '../appConfig';
import moment from "moment";
import "moment/locale/th"; // without this line it didn't work
moment.locale("th");





export default class App extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      gesturesEnabled: false,
      headerLeft: () => ( //สร้างฟังชั่นด้านบนซ้าย
        // เรียกใช้ฟังชั่น OpenDrawer เพื่อเปิดเมนูด้านซ้าย
        <TouchableOpacity onPress={navigation.getParam("OpenDrawer")}>
          <Image
            style={styles.MenuStyle}
            source={require("../assets/icon/menu.png")}
          />
        </TouchableOpacity>
      )
    };
  };
 

  state = { 
    drawerOpen: false, // ตัวแปรสำหรับเปิดปิดเมนู
    drawerDisabled: false,
    typing: false, // check keyboard
    searchTxt: "", // เก็บค่าคำที่ใช้ค้นหา
    openMenu: false, // ค่าเปิดปิด Menu
    markers: [ // เก็บค่าตำแหน่งปัจจุบันของ User
      {
        title: "Your Location",
        description: "คุณอยู่ที่นี่"
      }
    ],
    open : false, // ค่าเปิดปิด Search
    User : '', // เก็บค่า User จาก Localstorage
    region : { // เก็บค่าตำแหน่งของ Maps ขณะนั้น
      latitude: 0, 
      longitude: 0,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    },
    tempRegion : {}, //  เก็บค่าตำแหน่งของ Maps ชั่วคราว
    latlng: { //
      latitude: 0,////////// UpdateState Every 5 Sec
      longitude: 0
    }, 
    busStop: [], // เก็บข้อมูลป้ายรถ
    busLine: [],//// เก็บข้อมูลสายรถ
    BusActive : [] ,// เก็บข้อมูลรถที่ทำงานอยู่
  };

  componentDidMount = async() =>  {
    this.props.navigation.setParams({ OpenDrawer: this.openDrawer });
    try { // ดึงข้อมูลจาก Localstorage
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ User: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }
    // เรียกFunction
    await this.getLocation()
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()
    // เรียกFunction ทุก 5 วิ
    this.intervalID = setInterval(() => this.RefreshMaps(), 5000);
  }

  closeDrawer = () => { // ปิดเมนู
    this._drawer.close();
  };

  openDrawer = () => { // เปิดเมนู
    console.log("this.state.drawerOpen ::: ", this.state.drawerOpen)
    
    this.state.drawerOpen ? this._drawer.close() : this._drawer.open();
    this.setState({
      drawerOpen : !this.state.drawerOpen,
    })
  };

  goto = page => { // ฟั่งชั่นเปลี่ยนหน้า
    const { navigation } = this.props; // ดึงค่าจาก navigation
    this._drawer.close(); //ปิดMenu
    if (page == "logout") { // ถ้าเลือก logout จะถามก่อน
      Alert.alert(
        `กรุณายืนยัน`,
        `คุณต้องการออกจากระบบใช่หรือไม่?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "OK",
            onPress: () => {
              AsyncStorage.clear();
              navigation.navigate("Home");
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      navigation.navigate(page);
    }
  };
// อัพเดทค่า Maps ทุก 5 วินาที
  RefreshMaps = async () => {
    // console.log('state ::: ',this.state.region)
    try { //ดึงค่าตำแหน่งของ Map ที่อยู่ใน Localstorage มาอัพเดท
      const value = await AsyncStorage.getItem("@region");
      if (value !== null) {
        // console.log('AsyncStorage ::: ',value)
        await this.setState({ region: JSON.parse(value) });

      }
    } catch (error) {
      console.log(error);
    }

    // ดึงค่าตำแหน่งรถใหม่
    await this.fetchbusActiveData()
  };


  // ส่งค่าสำหรับ Search ข้อมูลไปยังหลังบ้าน
  fetchData = async () => {
    let {searchTxt} = this.state
    
    // Check ว่ามีคำค้นหาหรือไม่
    if(searchTxt == ""){
      // ถ้าไม่มีให้ใช้ Api นี้
      const response = await fetch(`${SettingApp}/busStop?searchText=${this.state.searchTxt}`)
      const busStop = await response.json()
      // console.log("busStop :::: ", busStop)
      await this.setState({ busStop })
    } else {
      const response = await fetch(`${SettingApp}/SearchBusStop?searchText=${this.state.searchTxt}`) // ถ้ามีให้ใช้ Api นี้ พร้อมส่งตัวแปร searchText ไปด้วย
      console.log("response :::: ",response.status)
      const tempBusStop = await response.json() // แปลงค่าที่รับมาเป็น Json
      const busStop = tempBusStop[1]  //นำค่าที่ได้ใส่ในตัวแปรนี้
      if(response.status) Alert.alert("ไม่พบข้อมูลที่ต้องการค้นหา กรุณาลองใหม่อีกครั้ง");
      await this.setState({ busStop })
    }
  }
//////////////////////////////////////////////
  fetchbusLineData = async () => { //ดึงข้อมูลสายรถ
    let {searchTxt} = this.state
    
    if(searchTxt == ""){  // Check ว่ามีคำค้นหาหรือไม่
      const response = await fetch(`${SettingApp}/busLine?searchText=${this.state.searchTxt}`)
      const busLine = await response.json()
      // console.log("busLine :::: ", busLine)
      let BuslineTemp = []
      // นำสายรถมาใส่ในตัวแปร โดยจัดรูปแบบใหม่
      busLine.map(e => {
        BuslineTemp.push({ data : e, show : false})
      })
      await this.setState({ busLine : BuslineTemp })
    }
    else {
      // ถ้ามีคำค้นหา 
      const response = await fetch(`${SettingApp}/SearchBusStop?searchText=${this.state.searchTxt}`)
      const busLine = await response.json()
      let busLine2 = busLine[0]
      let BuslineTemp = []
      busLine2.map((e, key) => {
        BuslineTemp.push({ data : e, show : false})
      })
      await this.setState({ busLine : BuslineTemp })
    }
  }


  // ดึงข้อมูลตำแหน่งปัจจุบันของ User Code เป็น Pattle ของ getLocation
  getLocation = async () => {
    console.log('in geo')
    navigator.geolocation.getCurrentPosition(
      position => {
        //// นำค่าที่ได้มาเก็บในตัวแปรที่ตั้งไว้
        let latlng = {
          latitude: parseFloat(JSON.stringify(position.coords.latitude)),
          longitude: parseFloat(JSON.stringify(position.coords.longitude))
        }
        let region ={
          latitude: parseFloat(JSON.stringify(position.coords.latitude)),
          longitude: parseFloat(JSON.stringify(position.coords.longitude)),
          latitudeDelta : this.state.region.latitudeDelta,
          longitudeDelta : this.state.region.longitudeDelta
        }
        try {
           AsyncStorage.setItem('@region', JSON.stringify(region));
        } catch (error) {
          console.log(error)
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
        latitudeDelta : this.state.region.latitudeDelta,
        longitudeDelta : this.state.region.longitudeDelta
      }
      try {
        AsyncStorage.setItem('@region', JSON.stringify(region));
      } catch (error) {
        console.log(error)
      }
      this.setState({ latlng , region })
    })
  }

  // ดึงข้อมูลรถที่กำลังวิ่งอยู่
  fetchbusActiveData = async () => {
    let {searchTxt, busLine} = this.state
    let lineQuery = [] //สร้างตัวแปรสำหรับเก็บสายรถ
    if(searchTxt == ""){ 
    const response = await fetch(`${SettingApp}/getVehicleActive`)
    const BusActive = await response.json()
    await this.setState({ BusActive})
    }else { 
      busLine.map(item => {
        lineQuery.push(item.data.busline_code)
      })
      const response = await fetch(`${SettingApp}/getVehicleActiveQuery?Vehicle_Type='bus'&lineQuery=${lineQuery}`)
      const BusActive = await response.json()
      await this.setState({ BusActive})
    }
  }

  
  componentWillUnmount = () => {
    navigator.geolocation.clearWatch(this.watchID)
    clearInterval(this.intervalID);
  }

  // เมื่อไม่ได้ทำการพิมพ์ค้นหา
  onOutFocus = async () => {
    Keyboard.dismiss()
    await this.setState({ typing: false, searchTxt : '' })
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()

  }

  // กดตกลงค้นหา
  onSearchSubmit = async () => {
    await this.setState({ typing: false })
    await this.fetchData()
    await this.fetchbusLineData()
    await this.fetchbusActiveData()

  }


  // เปิดข้อมูลของแต่ละสาย
  openDetail = (id) => {
    let { busLine } = this.state;
    // นำไอดีที่ได้มาเทียบกับข้อมูลเพื่อเปิดข้อมูลที่เลือก
    const tempIndex = busLine.findIndex( e => {
        return e.data.busline_code == id
    });
    busLine[tempIndex].show = !busLine[tempIndex].show;
    this.setState({busLine});
} 

  /// เก็บค่าที่ map ที่เปลี่ยนใน Localstorage
  onRegionChangeComplete = async(region) => {
    // console.log('onRegionChangeComplete ::: ', region);
    try {
      await AsyncStorage.setItem('@region', JSON.stringify(region));
    } catch (error) {
      console.log(error)
    }
  };

  // เปิดเมนูและทำการเก็บค่าที่ map ที่เปลี่ยนใน Localstorage
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
    return (
      <Drawer //Menu
        ref={ref => (this._drawer = ref)}
        type="static"
        content={ // Content ที่จะโชว์ Menu
          <ScrollView style={styles.containerIn}>
            <TouchableOpacity
              style={styles.buttonActive}
              onPress={() => this.goto("Menu")}
            >
              <Image
                style={styles.MenuItem}
                source={require("../assets/icon/home.png")}
              />
              <Text style={styles.TextItem}>หน้าแรก </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.goto("Profile")}
            >
              <Image
                style={styles.MenuItem}
                source={require("../assets/icon/profile.png")}
              />
              <Text style={styles.TextItem}>ข้อมูลส่วนตัว</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.goto("logout")}
            >
              <Image
                style={styles.MenuItem}
                source={require("../assets/icon/logout.png")}
              />
              <Text style={styles.TextItem}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </ScrollView>
        }
        styles={{
          main: { shadowColor: "#000000", shadowOpacity: 0.3, shadowRadius: 15 }
        }}
        captureGestures={false}
        tweenDuration={100}
        panThreshold={0.08}
        disabled={this.state.drawerDisabled}
        openDrawerOffset={viewport => {
          return 160;
        }}
        closedDrawerOffset={() => 1}
        negotiatePan
      >
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
          {/* นำค่ารถที่กำลังวิ่งอยู่มาแสดง */}
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
                { 
                marker.Vehicle_Type == "Bus" && marker.BreakDown_Status == 0 ? <BusActive textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Bus" && marker.BreakDown_Status == 1 ? <BusBreakDown textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Boat" && marker.BreakDown_Status == 0 ? <BoatActive textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Boat" && marker.BreakDown_Status == 1 ? <BoatBreakDown textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Van" && marker.BreakDown_Status == 0 ? <VanActive textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Van" && marker.BreakDown_Status == 1 ? <VanBreakDown textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Truck" && marker.BreakDown_Status == 0 ? <TruckActive textLine={marker.busline_code}   /> : 
                marker.Vehicle_Type == "Truck" && marker.BreakDown_Status == 1 ? <TruckBreakDown textLine={marker.busline_code}   /> : <></>                
                }
              </Marker>
            )
          })}
          {/* นำค่าตำแหน่งปัจจุบันของ User มา Show*/}
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
{/* //////////////////////////////////////////////////////////////// */}

        <MenuSlide
          openMenu={this.state.openMenu}
        >
         <TouchableOpacity style={{width : Dimensions.get("window").width}} onPress={() => this.openMenuFunc()}>
            <TextMenuSlide openMenu={this.state.openMenu}>Bus</TextMenuSlide>
         </TouchableOpacity>
          <TouchableOpacity style={styles.Line} onPress={() => this.openMenuFunc()}/>
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
          {/* </KeyboardAwareScroll=View> */}

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
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 2,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "white"
  // },
  menuFlex: {
    flexDirection: "row"
  },
  LogoStyle: {
    width: 130,
    height: 130,
    marginBottom: 50,
    resizeMode: "contain"
  },
  space: {
    width: 30
  },
  containerIn: {
    backgroundColor: "white",
    flex: 1
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingStart: 20,
    paddingTop: 25,
    paddingBottom: 25,
    borderBottomColor: "#1C19CC",
    borderBottomWidth: 1
  },
  buttonActive: {
    backgroundColor: "lightgrey",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingStart: 20,
    paddingTop: 25,
    paddingBottom: 25,
    borderBottomColor: "#1C19CC",
    borderBottomWidth: 1
  },
  MenuStyle: {
    width: 25,
    height: 25,
    marginLeft: 15
  },
  MenuItem: {
    width: 25,
    height: 25,
    marginRight: 20
  },
  TextItem: {
    fontSize: 20,
    color: "#1C19CC"
  },
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
});



let width = Dimensions.get("window").width
let height = Dimensions.get("window").height

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