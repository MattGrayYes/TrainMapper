import "jsr:@std/dotenv/load";
// Configure your .env file with your RTT API key details.
// Select your train here
const serviceUid: string = "C71480"; // eg. C47426, get from a realtimetrains.co.uk URL
const serviceDate: string = "2024/12/15"; // eg. 2024/12/14. YYYY/MM/DD

const rttApiKey: string = Deno.env.get("RTTAPIKEY") as string;
const rttApiSecret: string = Deno.env.get("RTTAPISECRET") as string;

const crses: string[] = [];
let query: string = "[out:json];\n(\n";
const queryEnd: string = ");\nout geom;";
const locations: string[] = [];

let mapurl: string = "https://signal.eu.org/osm/#locs=";

console.log("\n**Train Mapper**\n")

fetch("http://api.rtt.io/api/v1/json/service/"+serviceUid+"/"+serviceDate, {method:'POST', 
    headers: {'Authorization': 'Basic ' + btoa(rttApiKey+":"+rttApiSecret)}})
    .then(response => response.json())
    .then((train)=>{
        console.log(train.origin[0].publicTime, train.origin[0].description, "to", train.destination[0].description)
        console.log(train.serviceUid, train.trainIdentity, train.atocName, "\n\nCalling at:")
        train.locations.forEach((location)=>{
            console.log(location.crs, location.crs, location.description)
            crses.push(location.crs);
        })
    })
    .then(()=>{
        crses.forEach((crs: string)=>{
            query += "nwr[\"ref:crs\"=\""+crs+"\"];\n";
        })
        query += queryEnd;
        return fetch("https://overpass-api.de/api/interpreter", {method:'POST', body:query})
    })
    .then(response => response.json())
    .then((locData) =>{
        locData.elements.forEach((loc)=>{
            locations[loc.tags['ref:crs']] = loc.lat + "," + loc.lon;
        })

        crses.forEach((crs: string)=>{
            mapurl += locations[crs] +";";
        })

        console.log("\n",mapurl)
        console.log("\n**\n")
    })


