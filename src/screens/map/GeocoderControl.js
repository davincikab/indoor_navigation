import React, { useState, useEffect } from 'react';
import {    
    View, 
    TextInput, 
    FlatList, 
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight, 
    Text,
    Button} from 'react-native';
import RoundButton from '../../library/RoundButton';
import edges from '../../../assets/data/edges';
import CalculateRoute from '../../utils/routing/CalculateRoute';

var obstacle  = {
    "type": "FeatureCollection",
    "name": "obstacle_polygons",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
    { "type": "Feature", "properties": { "fid": 1.0, "Name": "Ground Flloor", "Area": 20.28728, "height": 4.0, "use": "None", "level": 1.0, "image": null, "base_heigh": 4.0, "color": "grey" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 36.963070271457362, -0.399120213964914 ], [ 36.963069691221691, -0.399151980225768 ], [ 36.963075590259848, -0.39915210289473 ], [ 36.963075587694526, -0.399162525881851 ], [ 36.963063187791825, -0.399161795603598 ], [ 36.963062122464379, -0.399209810820704 ] ] ] } },
    ]
};
 
const GeocoderControl = ({data, controlZIndex, activeLevel, toggleGeocoder, updatePath}) => {
    const [startAddress, setStartAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [activeInput, setActiveInput] = useState();
    const [startId, setStartId] = useState();
    const [destinationId, setDestionationId] = useState();
    const [ origin, setOrigin] = useState();
    const [ destination, setDestination] = useState();

    const [addresses, setAddress] = useState([]);
    const [indoorPoints, setIndoorPoints] = useState();
    const [controlIndex, setControlIndex] = useState();

    // update the zIndex
    useEffect(() => {
        console.log("GeocoderIndex: " + controlIndex);
        setControlIndex(controlZIndex);

        let points = JSON.parse(JSON.stringify(data));
        points.features = points.features.filter(feature => feature.properties.level == activeLevel);
        setIndoorPoints(points);
    }, [controlZIndex, activeLevel]);


    // filter addresses
    const filterAddress = (inputText) => {
        // get the address matching the query
        console.log(inputText);
        let address = JSON.parse(JSON.stringify(indoorPoints));

        address.features = address.features.filter(feature => {
            if(feature.properties.Name.toLowerCase().includes(inputText.toLowerCase())){
                return feature;
            }
        });
   
        if(address.features.length > 10) {
            setAddress(address.features.slice(0,15));
        }else{
            setAddress(address.features);
        }
        
    };

    const onStartLocationChange = (text) => {
        // setStartAddress(event);
        setStartAddress(text);

        if(!text) {
            setAddress([]);
            return;
        }

        console.log("Text Input: " + text);
        filterAddress(text); 
    };

    const onDestinatioLocationChange = (text) =>{
        console.log(text)
        setDestinationAddress(text);

        if(!text) {
            setAddress([]);
            return;
        }
        filterAddress(text);
    };

    // update the addresses
    const onFocus = () => {
        
    }   

    // On item press
    const onItemPress = (item) => {
        console.log(item.properties.Name);
        if(activeInput == "origin") {
            setStartAddress(item.properties.Name);
            setStartId(item.properties.fid);


            setOrigin(item);
        } else {
            setDestinationAddress(item.properties.Name);
            setDestionationId(item.properties.fid);
            setDestination(item);
        }
        
        setAddress([]);
    }

    const calculateRoute = () => {
    
        // spinner update the path
        let pointsClone = JSON.parse(JSON.stringify(indoorPoints));
        pointsClone.features = pointsClone.features.filter(feature => feature.properties.level == activeLevel);
        
        let coords = pointsClone.features.map(feature => {
            let coord = feature.geometry.coordinates;
        
            coord.push(feature.properties.fid);
        
            return coord;
        });

        let myRoute = new CalculateRoute(coords, obstacle,activeLevel);
        myRoute.edges = edges[activeLevel];
        let routeFeatures = myRoute.getRoute(startId, destinationId);

        console.log(routeFeatures);
        if(routeFeatures.type) {
            // strip the extra coordinates
            routeFeatures.geometry.coordinates = routeFeatures.geometry.coordinates.map(coord => {
                coord = coord.slice(0,2);
                return coord
            });

            console.log(routeFeatures);

            let geojsonRoute = {
                'type':'FeatureCollection',
                'features':[routeFeatures]
            };

            console.log(geojsonRoute);
            updatePath(geojsonRoute, origin, destination);

        } else {
            // update route info
            
        }

        // hide this component
        setControlIndex(0);
    }

    // flatlist items
    const renderItem = ({index, item}) => {
        return (
            <TouchableHighlight
                onPress={() => onItemPress(item)}
            >
                <View
                    style={{
                        backgroundColor: "#fff",
                        ...styles.resultItem
                    }}
                >
                    <Text
                        style={styles.textBold}
                    >
                        {item.properties.Name}
                    </Text>
                    <Text
                        style={styles.textSmall}
                    >
                        Floor {item.properties.level}, {item.properties.block}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }



    return (
        <View
            style={{
                zIndex:controlIndex,
                ...styles.geocoderView
            }}
        >   
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => toggleGeocoder()}
            >
                <Text>Back</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.formControl}
                key={'start'}
                placeholder={"Current Location ...."}
                onChangeText={text => onStartLocationChange(text)}
                onFocus={() => setActiveInput("origin")}
                value={startAddress}
            ></TextInput>

            <TextInput
                style={styles.formControl}
                key={"destination"}
                placeholder={"Destination Location ...."}
                onChangeText ={text => onDestinatioLocationChange(text)}
                onFocus={() => setActiveInput("destination")}
                value={destinationAddress}
            ></TextInput>

            {/* Results View */}
            <View
                style={ styles.resultsView}
            >
                {
                    addresses[0] &&
                    <FlatList
                        data={addresses}
                        renderItem={renderItem}
                        keyExtractor={item => item.properties.fid.toString()}
                    />
                }
                
            </View>
            {
                Boolean(destinationAddress) && Boolean(startAddress) &&
                <RoundButton
                    onPress={calculateRoute}
                    text="Go home"
                    styles={{
                        borderRadius:35,
                        height:70,
                        width:70,
                        marginLeft:"40%",
                    }}
                />
             }
        </View>
    );
}

const styles = StyleSheet.create({
    geocoderView:{
        display:"none",
        flex:0,
        position:"absolute",
        top:4,
        left:0,
        right:0,
        bottom:0,
        backgroundColor:'white'
    },
    formControl:{
        paddingHorizontal:12,
        paddingVertical:5,
        backgroundColor:"white",
        borderColor:"#ddd",
        borderWidth:0.5,
        borderTopWidth:0,
        borderLeftWidth:0,
        borderRightWidth:0,
        marginHorizontal:25
    },
    backButton:{
        position:"relative",
        backgroundColor:'#de34',
        width:36,
        marginLeft:3,
        marginTop:2,
        marginBottom:0,
        paddingHorizontal:2,
        paddingVertical:4
    },
    resultsView:{
        flex:0.8,
        backgroundColor:'white',
        // height:450,
        marginTop:10
        // paddingHorizontal:30
    },
    resultItem:{
        paddingVertical:5,
        borderTopWidth:1,
        borderColor:"#ddd",
        paddingHorizontal:30
    },
    textBold:{
        fontSize:15,
        fontWeight:"800",
        fontStyle:"normal",
        color:"#2e2e2e"
    },
    textSmall:{
        fontSize:14,
        color:"#000",
        fontStyle:"italic"
    }
});

export default GeocoderControl;


// TODO: Animate the layout