import './App.css';
import "@aws-amplify/ui-react/styles.css";
import Test from './Test';
import Home from './Routes/Home';

import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import HomeNavigator from './Components/HomeNavigator';
import MainScreen from './Components/MainScreen';


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeNavigator/>,
    children: [
      { path: '/', element: <MainScreen/>},
      { path: '/test', element: <Test/>},
      { path: '/home', element: <Home/>}
    ]
  }
  
])


function App() {
  return (
    <RouterProvider router = {router} /> 
  )
}

export default App;


