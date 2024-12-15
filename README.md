# Train Mapper
This takes a UK National Rail service UID and generates a URL for signal.eu.org, with the train's calling points as waypoints on the map.

This is still a first proof of concept that I'm playing with. Don't expect it to work amazingly well.

## Known Issues
* If theres at least one location in the route without a CRS, it'll crash.
* I'm just using CRS locations from OSM, which is generally in the middle of the station. Therefore it doesnt know which platform it's on etc, so signal.eu.org may misinterpret it a bit.
    * For example: Kings Cross' lat/lon is directly above the Piccadilly line. So it routes you out of KGX along the Piccadilly Line to Gunnersbury, along the Suffragette Line, and then onto the ECML.

## Use
### Requirements
* Requires [Deno](https://deno.com/)
* Requires [RealTimeTrains API](https://api.rtt.io/) key.

### Running It
1. Run `deno task web`
1. Go to http://localhost:8080/

### CLI version
1. Change `serviceUid` and `serviceDate` in main.ts to match your train.
    * Search for a train on https://www.realtimetrains.co.uk, and copy the UID from the URL.
1. Run `deno task dev`

## Example

* C47426, 2024/12/14: [1000 Kings Cross to Aberdeen on RealTimeTrains](https://www.realtimetrains.co.uk/service/gb-nr:C47426/2024-12-14#allox_id=0)
* [Generated map of route on signal.eu.org](https://signal.eu.org/osm/#locs=51.532395,-0.123022;53.957704,-1.093730;54.520662,-1.546691;54.968336,-1.616046;55.774555,-2.010542;55.951902,-3.190420;55.945184,-3.219374;56.035239,-3.395417;56.111999,-3.167054;56.374796,-2.893855;56.457149,-2.969749;56.559338,-2.589274;56.712830,-2.472217;56.966862,-2.225283;57.142649,-2.097635)

### CLI Output

```
deno task dev
Task dev deno run --watch --allow-net main.ts
Watcher Process started.

**Train Mapper**

1000 London Kings Cross to Aberdeen
C47426 1W11 LNER 

Calling at:
KGX KGX London Kings Cross
YRK YRK York
DAR DAR Darlington
NCL NCL Newcastle
BWK BWK Berwick-upon-Tweed
EDB EDB Edinburgh
HYM HYM Haymarket
INK INK Inverkeithing
KDY KDY Kirkcaldy
LEU LEU Leuchars
DEE DEE Dundee
ARB ARB Arbroath
MTS MTS Montrose
STN STN Stonehaven
ABD ABD Aberdeen

 https://signal.eu.org/osm/#locs=51.5323954,-0.1230224;53.9577037,-1.0937301;54.5206617,-1.5466911;54.9683364,-1.616046;55.7745555,-2.0105423;55.9519018,-3.1904199;55.9451838,-3.2193738;56.0352386,-3.3954171;56.1119986,-3.1670545;56.374796,-2.8938545;56.4571485,-2.9697488;56.5593376,-2.5892737;56.7128296,-2.4722165;56.9668616,-2.225283;57.1426487,-2.0976346;
```