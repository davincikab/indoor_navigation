import * as turf from '@turf/turf';
import points from '../../../assets/data/points.json';

export default function getDirections(data) {
    let directionCoords = data.geometry.coordinates;

    let coordsLength = directionCoords.length - 1;
    // create a direction objects
    let directionObj = [];
    for (let i = 0; i < directionCoords.length; i++) {
        let direction = {};
       
        if(i == coordsLength) {
            direction.from = getPointName(directionCoords[i][2]);
        } else {
            direction.from = getPointName(directionCoords[i][2]);
            direction.distance = getDistance(directionCoords[i], directionCoords[i+1]);
            direction.bearing = getBearing(directionCoords[i], directionCoords[i+1])
        }
        
        direction.coordinates = directionCoords[i];

        directionObj.push(direction);
    }

    console.log(directionObj);
    return directionObj;
}

function getDistance(p1, p2) {
    let from = turf.point([...p1]);
    let to = turf.point([...p2]);
    let options = {units: 'kilometers'};

    let distance = turf.distance(from, to, options);

    return (distance * 1000).toFixed(1);
}

function getBearing(p1, p2) {
    let point1 = turf.point([...p1]);
    let point2 = turf.point([...p2]);
    var bearing = turf.bearing(point1, point2);

    return bearing.toFixed(1);
}

function getPointName(fid) {
    // console.log(fid)
    return points.features.find(feature => feature.properties.fid == fid).properties.Name;
}