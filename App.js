import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapContainer from './src/screens/map/MapScreen';


export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <View style={styles.mainView}>
        <MapContainer />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  container: {
    height: 650,
    width: 450,
    backgroundColor: "tomato"
  },
  map: {
    flex: 1,
    top:0,
    bottom:0,
    left:0,
    right:0,
    zIndex:0,
    position:'absolute',
    zIndex:0
  }
});