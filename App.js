import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import indoorMapGeoJSON from './assets/block.json';

import IndoorControl from './src/screens/map/IndoorControl'

MapboxGL.setAccessToken("pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA");

const layerStyles = {
  building: {
    fillExtrusionOpacity: 0.5,
    fillExtrusionHeight: ['get', 'height'],
    fillExtrusionBase: ['get', 'base_height'],
    fillExtrusionColor: ['get', 'color'],
    // fillExtrusionColorTransition: {duration: 2000, delay: 0},
  },
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderValue: 80,
      data:{},
      activeFloor:{}
    };

    // this.isMounted = false;

    this.onSliderChange = this.onSliderChange.bind(this);
    this.onFloorChange = this.onFloorChange.bind(this);
  }

  onSliderChange(value) {
    this.setState({sliderValue: value});
  }

  onFloorChange(level) {
    // filter the data for specific floor
    let allfloors = this.state.data;
    let activeFloorData = allfloors.features.map(feature => {
        if(feature.properties.level <= level){
          return feature
        }
      }
      ).filter(feature => feature);

    allfloors.features = activeFloorData;
    
    console.log(allfloors.type);
    this.setState({
      activeFloor:allfloors
    });
  }

  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
    // this.isMounted = true;

    // if(this.isMounted) {
      
    // }

    console.log("Mounting");
    this.setState({
      activeFloor:indoorMapGeoJSON,
      data:indoorMapGeoJSON
    });
   
  }

  componentWillUnMount() {
    // this.isMounted = false;
  }

  render() {
    let indoorData = this.state.activeFloor;

    return (
        <View style={styles.mainView}>
          <MapboxGL.MapView 
            ref={(ref) => (this.map = ref)}
            style={styles.map} 
            >
            <MapboxGL.Camera
              zoomLevel={18}
              pitch={60}
              heading={200}
              centerCoordinate={[36.962846352233818, -0.399017834239519]}
            />

          <MapboxGL.Light style={{position: [5, 90, this.state.sliderValue]}} />

          {
            indoorData.type &&
            <MapboxGL.ShapeSource
              id="indoorBuildingSource"
              shape={indoorData}>
              <MapboxGL.FillExtrusionLayer
                id="building3d"
                style={layerStyles.building}
              />
            </MapboxGL.ShapeSource>
          }

        </MapboxGL.MapView>
        <IndoorControl 
            levels = {[0, 1, 2]}
            onPress={this.onFloorChange}
          />
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