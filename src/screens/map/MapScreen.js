import React from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Text,
  Image,
  TouchableOpacity,
} from "react-native";

import MapboxGL from "@react-native-mapbox-gl/maps";
import indoorMapGeoJSON from '../../../assets/data/indoor.json';
import points from '../../../assets/data/points.json';

import IndoorControl from './IndoorControl';
import GeocoderControl from './GeocoderControl';
import DirectionsControl from '../../components/DirectionsControl';

MapboxGL.setAccessToken("pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA");

const layerStyles = {
  building: {
    fillExtrusionOpacity: 0.9,
    fillExtrusionHeight: ['get', 'height'],
    fillExtrusionBase: ['get', 'base_heigh'],
    fillExtrusionColor: ['get', 'color']
  },
  building2d:{
    fillColor:['get', 'color']
  },
  path:{
    lineColor:"#ef9f15",
    lineWidth:3
  }, 
  shortestPath:{
    lineColor:"red",
    lineWidth:3.2
  },
  startPoint:{
    textField:'A',
    iconColor:'brown'
  },
  destinationPoint:{
    textField:'D',
    iconColor:'blue'
  },
  pointSymbol:{
    iconImage:"marker"
  }
};

 

export default class MapContainer extends React.Component {
    constructor(props) {
        super(props);

        // map states
        this.state = {
            threed:true,
            center:[36.962846352233818, -0.399017834239519],
            zoom:18.8,
            pitch:0,
            sliderValue: 80,
            data:{},
            activeFloor:{}, 
            activeLevel:0,
            controlIndex:0,
            routingMode:false,
            results:[],
            startLocation:{},
            stopLocation:{},
            threed:false,
            path:{},
            shortestPath:{},
            positionMarker:[]
        };

    }

    onSliderChange = (value) => {
        this.setState({sliderValue: value});
    }
    
    onFloorChange = (level) => {
        // filter the data for specific floor    
        let allfloors = JSON.parse(JSON.stringify(this.state.data));
        
        let activeFloorData = allfloors.features.map(feature => {
            if(feature.properties.level == level){
              return feature
            }
          }
          ).filter(feature => feature);
    
        allfloors.features = activeFloorData;

        this.setState({
          activeLevel:level,
          activeFloor:allfloors
        });

    }

    toggleGeocoder = () => {
      this.state.controlIndex == 0 ? this.setState({controlIndex:3}) : this.setState({controlIndex:0});
      this.setState({
        startLocation:{},
        stopLocation:{},
        path:{},
        shortestPath:{}
      });
    }

    toggleViewMode = () => {
      const { threed } = this.state;

      console.log("Mode: " + threed);
      this.setState({
        threed:!threed,
        pitch:!threed ? 60 : 0
      });
    }

    // update the path 
    updateShortestPath = (path,route, origin, destination) => {
      this.setState({
        shortestPath:route,
        startLocation:origin,
        stopLocation:destination,
        path:path
      });
    }

    updatePositionMarker = (item) => {
      console.log("Item Update");
      console.log(item);
        this.setState({
          positionMarker:[...item.coordinates].slice(0,2),
          center:[...item.coordinates].slice(0,2),
          zoom:22
        });
    }

    // load the data 
    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);

        const { activeLevel } = this.state;
      
        let activeFloorData = JSON.parse(JSON.stringify(indoorMapGeoJSON));
        activeFloorData.features = activeFloorData.features.filter(feature => feature.properties.level == activeLevel);

        this.setState({
          activeFloor:activeFloorData,
          data:JSON.parse(JSON.stringify(indoorMapGeoJSON)),
        });
    }

    // unmount the component
    componentWillUnmount() {
     
    }

    render() {
        // let activeFloor = this.state.activeFloor;
        const { center, zoom, pitch, controlIndex, path, activeFloor,
           shortestPath, startLocation,stopLocation, 
           activeLevel, threed, positionMarker } = this.state;

        console.log("PositionMarker");
        console.log(positionMarker);
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={-50}
          >
            <View style={styles.mainView}>
              {
                controlIndex == 3 &&
                <View style={{
                    flex:0.4, 
                    zIndex:4
                }}>
                  <GeocoderControl 
                    data={points}
                    controlZIndex={controlIndex}
                    activeLevel={activeLevel}
                    toggleGeocoder={this.toggleGeocoder}
                    updatePath={this.updateShortestPath}
                  />
                </View>
              }
            
              <View style={{flex:1, position:'relative'}}>
                <MapboxGL.MapView 
                  ref={(ref) => (this.map = ref)}
                  style={styles.map} 
                >
                <MapboxGL.Camera
                  zoomLevel={zoom}
                  pitch={pitch}
                  heading={200}
                  centerCoordinate={center}
                />

                  {/* <MapboxGL.Light style={{position: [5, 90, this.state.sliderValue]}} /> */}
                  <MapboxGL.Images 
                    images={{
                      'marker':require("../../../assets/images/icon.png")
                    }}
                  />

                  {
                  activeFloor.type && threed &&
                  <MapboxGL.ShapeSource
                    id="indoorBuildingSource"
                    shape={activeFloor}>
                    <MapboxGL.FillExtrusionLayer
                      id="building3d"
                      style={layerStyles.building}
                    />
                  </MapboxGL.ShapeSource>
                }

                {
                  activeFloor.type &&
                  <MapboxGL.ShapeSource
                    id="indoor_2d"
                    shape={activeFloor}
                  >
                    <MapboxGL.FillLayer 
                      id="building2d"
                      style={layerStyles.building2d}
                    />
                  </MapboxGL.ShapeSource>
                }

                {
                  shortestPath.type &&
                  <MapboxGL.ShapeSource
                    id="shortest-path"
                    shape={shortestPath}
                  >
                    <MapboxGL.LineLayer 
                      id="short-path"
                      style={layerStyles.shortestPath}
                    />
                  </MapboxGL.ShapeSource>
                }

                {
                  startLocation.type &&
                  <MapboxGL.MarkerView coordinate={startLocation.geometry.coordinates}>
                    <View style={[ styles.routeMarker, styles.origin]}>
                      <Text style={styles.markerText}>S</Text>
                    </View>
                  </MapboxGL.MarkerView>
                }
                {
                  stopLocation.type &&
                  <MapboxGL.MarkerView coordinate={stopLocation.geometry.coordinates}>
                    <View style={[styles.routeMarker, styles.destination]}>
                      <Text style={styles.markerText}>D</Text>
                    </View>
                  </MapboxGL.MarkerView>
                }

                {
                  positionMarker[0] &&
                  <MapboxGL.MarkerView coordinate={positionMarker}>
                    <View  style={styles.positionMarker}></View>
                    {/* <Image style={styles.positionMarker} source={require("../../../assets/images/icon.png")} /> */}
                  </MapboxGL.MarkerView>
                }

            </MapboxGL.MapView>

            <IndoorControl 
              levels = {[0, 1, 2]}
              activeLevel={activeLevel}
              onPress={this.onFloorChange}
              onToggleGeocoder={this.toggleGeocoder}
            />

            <TouchableOpacity
              onPress= {this.toggleViewMode}
              style={styles.buttonSpeechStart}
            >
              <Text 
                styles={{
                  color:"red"
                }}
              >{threed ? "3D" : "2D"}</Text>
            </TouchableOpacity>
          </View>
          
          {/* direction tabs */}
          { path.type && 
            <View style={styles.directionContainer}>
              <DirectionsControl 
                path={path}
                isCollpsed={false}
                onPress={this.updatePositionMarker}
              />
            </View>
          }
          
        </View>
        </KeyboardAvoidingView>
        )
    }
}

// styles
const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: "#F5FCFF"
    },
    container: {
        flex:1,
        backgroundColor: "tomato"
    },
    map: {
        flex: 1,
        zIndex:0
    },
    searchContainer:{
      flex:0.4
    },
    directionContainer:{
      flex:0.4
    },
    buttonSpeechStart:{
      position:"absolute",
      zIndex:1,
      top:12,
      left:12,
      backgroundColor:'#fff',
      padding:6,
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
    },
    positionMarker:{
      backgroundColor:"#156504",
      borderColor:"#fff",
      borderWidth:2,
      width:20,
      height:20,
      borderRadius:10
    },
    routeMarker:{
      padding:3,
      height:20,
      width:20,
      borderRadius:10,
      justifyContent:'center',
      alignItems:'center'
    },
    origin:{
      backgroundColor:"blue",
    },
    destination:{
      backgroundColor:"red",
    },
    markerText:{
      fontWeight:"700",
      fontSize:15,
      color:"#fff"
    }
});
