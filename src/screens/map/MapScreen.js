import React from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Text,
  TouchableOpacity,
} from "react-native";

import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

import MapboxGL from "@react-native-mapbox-gl/maps";
import indoorMapGeoJSON from '../../../assets/data/indoor.json';
import points from '../../../assets/data/points.json';

import IndoorControl from './IndoorControl';
import GeocoderControl from './GeocoderControl';

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
            centre:[],
            zoom:18.8,
            pitch:0,
            sliderValue: 80,
            data:{},
            activeFloor:{}, 
            activeLevel:0,
            controlIndex:0,
            results:[],
            start:false,
            end:false,
            recognized:false,
            language:'en-US',
            voice:'',
            startLocation:{},
            stopLocation:{},
            threed:false,
            path:{},
            shortestPath:{}
        };

        Voice.onSpeechStart = this.onSpeechStartHandler.bind(this);
        Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
        Voice.onSpeechRecognized = this.onSpeechRecognizedHandler.bind(this);
        Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
        this.onStartButtonPress.bind(this);
        this.textToSpeech.bind(this);

        Tts.setDefaultLanguage(this.state.language);
        Tts.setDefaultVoice("sw");
        Tts.setDefaultRate(0.4);
    }

    async onStartButtonPress(e){
      // this.setState({
      //   recognized: false,
      //   start: false,
      //   end:false,
      //   results: [],
      // });

      try {
        await Voice.start('en-US').catch(error => {
          throw new Error(error.message);
        });

        console.log("Starting Voice Recognition");
      } catch (e) {
        // console.error(e);
        console.log("Error: " + e.message);
      }
    }

    onSpeechStartHandler(e) {
      console.log("Start Speech Recognition");
      this.setState({
        start:true
      });
    }

    onSpeechRecognizedHandler(e) {
      console.log("Speech Recognized");
      this.setState({
        recognized:true
      });
    }

    onSpeechEndHandler(e) {
      console.log("End Speech Recognition");
      this.setState({
        end:true
      });
    }

    onSpeechResultsHandler(e) {
      console.log(e.value);
      this.setState({
        results:e.value
      });
    }

    // tts
    textToSpeech() {
      Tts.voices().then(vc => {
        // console.log(vc);
        vc.forEach(v => {
          if(v.language.includes('sw')) {
            console.log(v);
          }
        });
      });
      
      Tts.speak("Tembea mita 150 ukielekea A2");
    }

    toggleLanguageAndVoice() {
      let voice = this.state.voice == "sw" ? "en-US" : "sw";
      let language = this.state.language == "sw-KE" ? "en-US" : "sw-KE";

      // check network connection
      this.setState({
        language,
        voice
      });
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
    updateShortestPath = (route, origin, destination) => {
      this.setState({
        shortestPath:route,
        startLocation:origin,
        stopLocation:destination
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
      Voice.destroy().then(Voice.removeAllListeners());
      Tts.stop();
    }

    render() {
        // let activeFloor = this.state.activeFloor;
        const { zoom, pitch, controlIndex, path, activeFloor, shortestPath, startLocation,stopLocation, activeLevel, threed } = this.state;

        console.log("shortest path");
        console.log(shortestPath);
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={-50}
          >
            <View style={styles.mainView}>
              <GeocoderControl 
                data={points}
                controlZIndex={controlIndex}
                activeLevel={activeLevel}
                toggleGeocoder={this.toggleGeocoder}
                updatePath={this.updateShortestPath}
              />

              <MapboxGL.MapView 
                ref={(ref) => (this.map = ref)}
                style={styles.map} 
              >
              <MapboxGL.Camera
                zoomLevel={zoom}
                pitch={pitch}
                heading={200}
                centerCoordinate={[36.962846352233818, -0.399017834239519]}
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

          <TouchableOpacity
            onPress= {this.textToSpeech}
            style={{
              marginLeft:70,
              ...styles.buttonSpeechStart
            }}
          >
            <Text 
              styles={{
                color:"red"
              }}
            >TSpeech</Text>
          </TouchableOpacity>
          
          {/* direction tabs */}

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
        top:0,
        bottom:0,
        left:0,
        right:0,
        zIndex:0,
        position:'absolute',
        zIndex:0
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
