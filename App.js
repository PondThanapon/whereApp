import { createStackNavigator, createAppContainer } from 'react-navigation';
import HomeScreen from './screens/HomeScreen'
import LinksScreen from './screens/LinksScreen';
import ShowMap from './screens/ShowMap';
import ShowMapVan from './screens/ShowMapVan';
import ShowMapTruck from './screens/ShowMapTruck';
import ShowMapBoat from './screens/ShowMapBoat';
import SignUp from './screens/SignUp';
import RegisVehicle from './screens/RegisVehicle';
import WorkTime from './screens/WorkTime';
import Profile from './screens/Profile';
import History from './screens/History';
import Vehicle from './screens/Vehicle';
import Menu from './screens/Menu';

const AppNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Menu: {screen: Menu},
  Links: {screen: LinksScreen},
  ShowMap: {screen: ShowMap},
  ShowMapBoat: {screen: ShowMapBoat},
  ShowMapTruck: {screen: ShowMapTruck},
  ShowMapVan: {screen: ShowMapVan},
  Vehicle: {screen: Vehicle},
  WorkTime: {screen: WorkTime},
  History: {screen: History},
  Profile: {screen: Profile},
  SignUp: {screen: SignUp},
  RegisVehicle: {screen: RegisVehicle},
});

const App = createAppContainer(AppNavigator);

export default App