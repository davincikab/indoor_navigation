import React from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Text,
  TouchableOpacity,
  Keyboard 
} from "react-native";

import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

import MapboxGL from "@react-native-mapbox-gl/maps";
import indoorMapGeoJSON from '../../../assets/block.json';

import IndoorControl from './IndoorControl';
import GeocoderControl from './GeocoderControl';

import * as turf from '@turf/turf';

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

export default class MapContainer extends React.Component {
    constructor(props) {
        super(props);

        // map states
        this.state = {
            threed:true,
            centre:[],
            zoom:18,
            pitch:220,
            sliderValue: 80,
            data:{},
            activeFloor:{}, 
            controlIndex:0,
            results:[],
            start:false,
            end:false,
            recognized:false,
            language:'en-US',
            voice:'',
        };

        

        this.onSliderChange = this.onSliderChange.bind(this);
        this.onFloorChange = this.onFloorChange.bind(this);

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

    onSliderChange(value) {
        this.setState({sliderValue: value});
    }
    
    onFloorChange(level) {
        // filter the data for specific floor    
        let allfloors = JSON.parse(JSON.stringify(this.state.data));
        
        let activeFloorData = allfloors.features.map(feature => {
            if(feature.properties.level <= level){
              return feature
            }
          }
          ).filter(feature => feature);
    
        allfloors.features = activeFloorData;

        this.setState({
          activeFloor:allfloors
        });

    }

    toggleGeocoder = () => {
      this.state.controlIndex == 0 ? this.setState({controlIndex:3}) : this.setState({controlIndex:0});
    }

    // load the data 
    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
      
        this.setState({
          activeFloor:indoorMapGeoJSON,
          data:JSON.parse(JSON.stringify(indoorMapGeoJSON))
        });
    }

    // unmount the component
    componentWillUnmount() {
      Voice.destroy().then(Voice.removeAllListeners());
      Tts.stop();
    }

    render() {
        let indoorData = this.state.activeFloor;

        return (
          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={-50}
          >
            <View style={styles.mainView}>
              <GeocoderControl 
                data={indoorMapGeoJSON}
                controlIndex={this.state.controlIndex}
                toggleGeocoder={this.toggleGeocoder}
              />

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
              onToggleGeocoder={this.toggleGeocoder}
          />

          <TouchableOpacity
            onPress= {this.onStartB}
            style={styles.buttonSpeechStart}
          >
            <Text 
              styles={{
                color:"red"
              }}
            >Speech</Text>
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
      // color:'white',
      backgroundColor:'#F2F2F2',
      padding:6,
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
    }
});


// Calculate the shortest path
// Initialize a list of coordinates
// create a graph object
// calculate the distances (weight), 
// remove the point from previous array
// push the point to line coordinates
// set the point to start 
// repeat step 2,3,4
// create the linework
// display the line