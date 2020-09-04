import * as turf from '@turf/turf';

class CalculateRoute {
    constructor(start, stop, coords, obstacle) {
        this.start = start;
        this.stop = stop;
        this.floor = floor;
        this.path = [];
        this.graph = {};
        this.edges = {};
        this.coords = coords;
        this.obstacle = obstacle;
    }

    createGraph() {
        this.coords = this.nameCoords(this.coords);

        var graph = {};
        var edges = {};

        for (let current of coords) {
            graph[current[2].toString()] = [];
            edges[current[2].toString()] = {};
            for(let comparer of coords) {
                if(comparer == current) {
                    continue;
                }else {
                

                    // tailor the graph.
                    var path = turf.lineString([current, comparer]);
                    // var fts = polygon;
                    if(
                        turf.booleanCrosses(path, polygon.features[0]) ||
                        turf.booleanCrosses(path, polygon.features[1])
                    ) {
                        continue
                    }else {
                        let weight = this.distanceBetweenNodes(current, comparer);
                        graph[current[2].toString()].push(comparer[2]);

                        edges[current[2].toString()][comparer[2].toString()] = weight;
                    }

                    

                }
            }
        }

        console.log(edges);
        return [graph, edges];
    }

    distanceBetweenNodes(start, stop) {
        // get the distance
        var start = start.slice(0,2).reverse();
        var end = stop.slice(0,2).reverse();

        var options = {
            obstacles: polygon
        };

        var path = turf.shortestPath(start, end, options);

        let distance = turf.length(path);
        return distance * 1000;
    }

    nameCoords(coords) {
        coords.forEach((element, i) => {
            element.push(i);
            return element;
        });
    
        return coords;
    }

    getShortestPath(graph, startNode, endNode) {
        // track distances
        let distances = {};
        distances[endNode] = "Infinity";
        distances[startNode] = Object.assign(distances, graph[startNode]);

        console.log(distances);

        // track paths using hash object
        let parents = {endNode:null};
        for (let child in graph[startNode]) {
            parents[child] = startNode;
        }

        console.log(parents);
        // collect visited node
        let visited = [];

        // find the nearest node
        let node = this.shortestDistanceNode(distances, visited);    

        console.log(node);
        // for that node
        while(node) {
            // find its distance from the start node & its child nodes
            let distance = distances[node];
            let children = graph[node];

            // for each child nodes
            for (let child in children) {
                // make sure the nodes is not startNode
                if(String(child) == String(startNode))  {
                    continue;
                } else {
                    // save distances from start to end node
                    let newDistance = distance + children[child];

                    // if there's no recorded distance from the start node to the child node in the distances object
                    // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
                    if(!distances[child] || distances[child] > newDistance){
                        distances[child] = newDistance;
                        parents[child] = node;
                    }
                }   
            }

            // move the current node to the visited set
            visited.push(node);
            node = shortestDistanceNode(distances, visited);

        }

        console.log(parents);
        // using the stored paths from start node to end node
        // record the shortest path
        let shortestPath = [endNode];
        let parent = parents[endNode];

        while(parent) {
            shortestPath.push(parent);
            parent = parents[parent];
        }

        shortestPath.reverse();

        let results = {
            distances:distances[endNode],
            path:shortestPath
        };

        console.log(results);

        return results;
    }


    shortestPathDistanceNode(ditance, node) {
        let shortest = null;
        for (const node in distances) {
            let currentIsShortest = shortest === null || distances[node] < distances[shortest];

            if(currentIsShortest && !visited.includes(node)){
                shortest = node;
            }
        }

        return shortest;
    }

    getRoute() {
        let {distances, path} = getShortestPath(edges, start, stop);

        let pt = path.map(pt => parseInt(pt));

        console.log(pt);
        let stpCoord = pt.reduce((pv,ac, i) => {
            if(coords[ac]) {
                pv.push(coords[ac]);
            }
            return pv;
        }, []);

        console.log(stpCoord);

        let shortestPath = turf.lineString(stpCoord);

        // add path to map
        return shortestPath;
    }

    getDirections() {
        let dir = "Walk ";

        return dir;
    }
}

// Directions



export default CalculateRoute;