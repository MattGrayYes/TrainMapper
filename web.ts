import "jsr:@std/dotenv/load";
// Configure your .env file with your RTT API key details.
// Select your train here

const rttApiKey: string = Deno.env.get("RTTAPIKEY") as string;
const rttApiSecret: string = Deno.env.get("RTTAPISECRET") as string;

import { Application, Router } from "jsr:@oak/oak";

console.log("\nTrainMapper Web started\n\n\n")

const router = new Router();

router.get("/", (ctx) => {
    ctx.response.body = 
       `<!doctype html>
        <html>
        <head>
            <title>Train Mapper</title>
        </head>
        <body>
            <h1>Train Mapper</h1>
            <p>To use this:</p>
            <ol>
                <li>Find a train using <a href="https://www.realtimetrains.co.uk/">RealTimeTrains</a> or similar
                <li>Look for the service UID and date of the train you want to map. You can get these from the end of a RealTimeTrains service URL (<a href="https://www.realtimetrains.co.uk/service/gb-nr:C71480/2024-12-15">for example this one</a>)
                <li>Append them to the URL of this page in the format /serviceUid/yyy/mm/dd (for example <a href="/C47426/2024/12/14">C47426/2024/12/14</a>)
            </ol>
            <hr>
            <p><a href="https://mattg.co.uk">Matt Gray</a></p>
        </body>
        `;
});

router.get("/:serviceUid/:yyyy/:mm/:dd", async (ctx) => {
    await getRoute(ctx.params.serviceUid, ctx.params.yyyy, ctx.params.mm, ctx.params.dd)
        .then((mapUrl) => {
            console.log("Got MapUrl", mapUrl)
            ctx.response.body = "<html><a href=\"" + mapUrl + "\">" + mapUrl + "</a>";
        })
        .catch((err) => {
            console.error("getroute caught Error: ", err);
            ctx.response.body = "Booo there's been an error :(\n"+err;
        });
});




const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });

async function getRoute(serviceUid: string, yyyy: string, mm: string, dd: string) {
    console.log("\n**Train Mapper**\n");

    let mapurl: string = "https://signal.eu.org/osm/#locs=";
    const crses: string[] = [];
    let query: string = "[out:json];\n(\n";
    const queryEnd: string = ");\nout geom;";
    const locations: string[] = [];

    const dateString: string = yyyy + "/" + mm + "/" + dd;

    console.log("http://api.rtt.io/api/v1/json/service/" + serviceUid + "/" + dateString)
    await fetch(
        "http://api.rtt.io/api/v1/json/service/" + serviceUid + "/" + dateString,
        {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(rttApiKey + ":" + rttApiSecret),
            },
        })
        .then(async (response) => {
            console.log(response);

            if(response.status != 200)
            {
                throw new Error("RTT API HTTP status "+response.status+" "+response.statusText)
            }
            else{
                const json = await response.json()
                .catch((err) => {
                    console.error(err, response, response.body);
                    throw new Error("RTT API response JSON parsing error "+ response)
                });
              
                if (json.hasOwnProperty("error")) {
                    throw new Error("RTT API Response error: " + json.error)
                }
                else
                    return json;
            }
        })
        .then((train) => {
            console.log(train);
            console.log(
                train.origin[0].publicTime,
                train.origin[0].description,
                "to",
                train.destination[0].description,
            );
            console.log(
                train.serviceUid,
                train.trainIdentity,
                train.atocName,
                "\n\nCalling at:",
            );
            train.locations.forEach((location) => {
                console.log(location.crs, location.crs, location.description);
                crses.push(location.crs);
            });
        })
        .then(async () => {
            crses.forEach((crs: string) => {
                query += 'nwr["ref:crs"="' + crs + '"];\n';
            });
            query += queryEnd;
            return await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query,
            });
        })
        .then((response) => response.json())
        .then((locData) => {
            locData.elements.forEach((loc) => {
                locations[loc.tags["ref:crs"]] = loc.lat + "," + loc.lon;
            });

            crses.forEach((crs: string) => {
                mapurl += locations[crs] + ";";
            });

            console.log("\n", mapurl);
            console.log("\n**\n");
        });

    return mapurl;
}
