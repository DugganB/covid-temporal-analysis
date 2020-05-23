import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";

import USCounties from "../data/counties.json";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},

      lat: 39.5,
      lng: -98.35,
      zoom: 5,
    };
  }

  idealDataStructure() {
    return {
      "01-01-2020": {
        fips_Code: "county_data",
        fips_code2: "county data",
        fips_code3: "county data",
      },
    };
  }

  componentDidMount() {}

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <div className="app" id="mapid">
        <Map center={position} zoom={this.state.zoom} className="map">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={USCounties}
            onEachFeature={(feature, layer, test) => {
              layer.on("mouseover", (e) => {
                e.target.setStyle({ stroke: true, fill: "black" });
              });
              layer.on("mouseout", (e) => {
                e.target.setStyle({ stroke: false, fill: "black" });
              });
            }}
            stroke={false}
          />
        </Map>
      </div>
    );
  }
}

export default App;
