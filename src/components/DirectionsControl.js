import React from 'react';
import PropTypes from 'prop-types';

import {
    View, Dimensions,
    StyleSheet, Text, FlatList, TouchableOpacity, Image
} from 'react-native';

import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

import getDirections from '../utils/routing/RouteDirection';

export default class DirectionsControl extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCollapsed:false,
            path:{},
            directions:[],
            time:null,
            distance:null,
            audioOn:false,
            isPlayMode:false,
            start:false,
            end:false,
            activeDirection:{},
            activeDirectionIndex:0,
            recognized:false,
            language:'en-US',
            voice:'',
        };

        this.itemsRef = React.createRef();
        this.textToSpeech.bind(this);

        Tts.setDefaultLanguage(this.state.language);
        Tts.setDefaultRate(0.4);
    }
  
    // tts
    textToSpeech() {
        const { activeDirection, directions } = this.state;

        Tts.voices().then(vc => {
          // console.log(vc);
          vc.forEach(v => {
            if(v.language.includes("en-US")) {
            //   console.log(v);
            }
          });
        });
        
        console.log("Active Direction speak")
        console.log(activeDirection);

        if(activeDirection.from) {
            let textInfo = activeDirection.turn
            if(activeDirection.index == 0) {
                textInfo =  "From " + textInfo + " walk " + activeDirection.distance + " metres";
            } else if( activeDirection.index == directions.length -1) {
                textInfo = 'You have arrived at your destination: ' + textInfo;
            } else {
                textInfo = textInfo + " and Walk " + activeDirection.distance + " metres";
            }

            Tts.speak(textInfo);
            
        }
        
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

    onAudioPress = () => {
        const { audioOn } = this.state;

        this.setState({
            audioOn:!audioOn
        }, () => {
            if(!this.state.audioOn) {
                Tts.stop();
            } else {
                this.textToSpeech();
            }
        });

        // update the
    }

    getIcon = (angle) => {
        if(!Boolean(angle)) {
            return require("../../assets/images/up-arrow.png");
        } else if (angle == 0) {
            return require("../../assets/images/up-arrow.png");
        } else if (angle < 180) {
            return require("../../assets/images/turn-left.png");
        } else {
            return require("../../assets/images/turn-right.png");
        }
    }

    onItemPress = (item) => {
        console.log("Item Press")
        console.log(item);
        this.props.onPress(item);
    }

    onPlayPress = () => {
        console.log("Play route");

        const { isPlayMode } = this.state;
        this.setState({
            isPlayMode:!isPlayMode
        }, () => {
            // call the loop function to iterate the flatlist Item
            if(this.state.isPlayMode) {
                this.timeInterval = setInterval((e) => {
                    let { activeDirectionIndex, directions } = this.state;
                    activeDirectionIndex = activeDirectionIndex + 1;

                    console.log('item index');
                    console.log(activeDirectionIndex);
                    if(activeDirectionIndex == directions.length) {
                        activeDirectionIndex = 0;
                        clearInterval(this.timeInterval);
                    }

                    this.slideTo(activeDirectionIndex);
                }, 5000);
            } else {
                clearInterval(this.timeInterval);
            }
        });
    }

    slideTo = (index) => {
        // console.log(this.itemsRef);
        // call slide to

        const { directions } = this.state;
        
        this.props.onPress(directions[index]);
        this.itemsRef.current.scrollToIndex({index});

        this.setState({
            activeDirectionIndex:index,
            activeDirection:directions[index]
        }, () => {
            if(this.state.audioOn) {
                this.textToSpeech();
            }
        });
    }

    renderItem = ({ item, index }) => {
        const { directions } = this.state;

        // console.log("Item index:" +index);

        let turn, icon;
        if(index == 0) {
            icon = require("../../assets/images/icon.png");
            turn = item.from;
        } else if( index == directions.length -1) {
            icon = require("../../assets/images/icon.png")
            turn = item.from;
        } else {
            let angle = item.bearing - directions[index-1].bearing;
            angle = angle < 0 ? angle + 2 * 180 : angle;

            turn = !Boolean(angle) ? "Head Straight": angle == 0  ? "Head Straight" : angle < 180 ? 'Turn Left' : "Turn Right";
            icon = this.getIcon(angle);
        }

        item.turn = turn;
        let distance = item.distance ? item.distance + " metres" : '';

        return (
            <TouchableOpacity style={styles.directionItem} onPress={() => this.onItemPress(item)}>
                <Image style={styles.image} source={icon} />
                <View>
                    <Text style={styles.place}>{turn}</Text>
                    <Text style={styles.distance}>{distance}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    getDirectionsWithTurn = (directions) => {
        directions.forEach((direction, index) => {
            let turn;
            if(index == 0) {
                turn = direction.from;
            } else if( index == directions.length -1) {
                turn = direction.from;
            } else {
                let angle = direction.bearing - directions[index-1].bearing;
                angle = angle < 0 ? angle + 2 * 180 : angle;
    
                turn = !Boolean(angle) ? "Head Straight": angle == 0  ? "Head Straight" : angle < 180 ? 'Turn Left' : "Turn Right";
            }
            
            direction.turn = turn;
            direction.index = index;

            return directions;
        });

        return directions;
        
    }

    componentDidMount() {
        const {isCollapsed, path} = this.props;
        let directions = getDirections(path);

        // update the turns
        directions = this.getDirectionsWithTurn(directions);

        console.log(directions);
        this.setState({
            isCollapsed:isCollapsed,
            path:path,
            directions:directions,
            activeDirection:directions[0],
            distance:path.properties.distance,
            time:path.properties.time
        });
    }

    componentWillUnMount() {
        Voice.destroy().then(Voice.removeAllListeners());
        Tts.stop();

        clearInterval(this.timeInterval);
    }   

    render() {
        const { isCollapsed, directions, time, distance, audioOn, isPlayMode} = this.state;
        let zIndex = isCollapsed ? 0 : 3;
        return (
            <View style={{
                    zIndex:zIndex,
                    ...styles.containerStyle
                }}
            >   
                <View style={styles.summary}>
                    <View style={styles.summaryTab}>
                        <Text style={[styles.summaryText,styles.timeText]}>{time}</Text>
                        <Text style={[styles.summaryText,styles.distanceText]}>({distance} m)</Text>
                    </View>

                    <View style={styles.audioControl}>
                        <TouchableOpacity onPress={this.onAudioPress} style={styles.buttonControl}>
                            <Image 
                                style={styles.buttonControlImage}
                                source={
                                    audioOn ? require("../../assets/images/volume.png") : require("../../assets/images/mute.png")
                                } 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onPlayPress} style={styles.buttonControl}>
                            <Image
                                style={styles.buttonControlImage} 
                                source={
                                    isPlayMode ? require("../../assets/images/pause-button.png") : require("../../assets/images/play-button.png")
                                } 
                            />
                        </TouchableOpacity>
                    </View>
                    {/* audio */}
                </View>                
                {directions[0] &&
                    <>
                        <Text>Steps</Text>

                        {/* HORIZONTAL */}
                        <FlatList
                            ref={this.itemsRef}
                            style={styles.stepsTab}
                            data={directions}
                            keyExtractor={item => item.from}
                            renderItem={this.renderItem}
                            horizontal={true}
                            onViewableItemsChanged={this.onViewableItemsChanged}
                        />
                    </>
                }
            </View>
        )
    }
}   

DirectionsControl.propTypes = {
    path:PropTypes.object.isRequired,
    isCollapsed:PropTypes.bool,
    onPress:PropTypes.func.isRequired
}

DirectionsControl.defaultProps = {
    isCollapsed:true
}

const styles = StyleSheet.create({
    containerStyle:{
        flex:1,
        bottom:0,
        backgroundColor:"#fff",
        left:0,
    },
    directionItem:{
        width:300,
        justifyContent:'flex-start',
        alignItems:'center',
        paddingVertical:5,
        paddingHorizontal:20,
        backgroundColor:"#fff",
        flexDirection:'row',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#CBD000',
        marginRight:35
    },
    image:{
        // height:24,
        // width:24,
        marginRight:10,
        resizeMode:'contain'
    },
    place:{
        fontSize:18,
        fontWeight:"600"
    },
    distance:{
        fontSize:15
    },
    summary:{
        justifyContent:"space-between",
        flexDirection:"row",
        alignItems:'center',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#ddd'
    },
    summaryTab:{
        justifyContent:'flex-start',
        flexDirection:"row",
        alignItems:'center',
        backgroundColor:"#fff",
        padding:10,
    },
    summaryText:{
        fontSize:20
    },
    audioControl:{
        marginRight:20,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    buttonControl:{
        marginHorizontal:5,
    },
    buttonControlImage:{
        height:18,
        resizeMode:'contain'
    },
    timeText:{
        color:'#156504',
        marginRight:10,
        fontSize:21,
        fontWeight:"700"
    },
    distanceText:{
        color:'#525252'
    },
    stepsTab:{
        paddingVertical:5,
        paddingHorizontal:15
    }
});