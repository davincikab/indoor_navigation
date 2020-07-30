import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import indoorMapGeoJSON from './assets/block.json';

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
      sliderValue: -80,
    };

    this.onSliderChange = this.onSliderChange.bind(this);
  }

  onSliderChange(value) {
    this.setState({sliderValue: value});
  }

  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
  }

  render() {
    return (
          <MapboxGL.MapView 
            ref={(ref) => (this.map = ref)}
            style={styles.map} 
            >
            <MapboxGL.Camera
              zoomLevel={16}
              pitch={40}
              heading={20}
              centerCoordinate={[36.962846352233818, -0.399017834239519]}
            />

          <MapboxGL.Light style={{position: [5, 90, this.state.sliderValue]}} />

          <MapboxGL.ShapeSource
            id="indoorBuildingSource"
            shape={indoorMapGeoJSON}>
            <MapboxGL.FillExtrusionLayer
              id="building3d"
              style={layerStyles.building}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
    );
  }
}



const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  container: {
    height: 650,
    width: 450,
    backgroundColor: "tomato"
  },
  map: {
    flex: 1
  }
});