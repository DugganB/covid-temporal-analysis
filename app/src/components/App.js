import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { Slider } from "@material-ui/core";

import USCounties from "../data/counties.json";
import ProcessedData from "../data/processed-data-per-county.json";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},

      lat: 39.5,
      lng: -98.35,
      zoom: 5,

      dateToDisplay: Object.keys(ProcessedData)[0],
      dateRangeValue: 0,
      dateArray: [...Object.keys(ProcessedData)],
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

  componentDidMount() {
    console.log(this.state.dateArray);
  }

  getColor(d) {
    return d > 1000
      ? "#800026"
      : d > 500
      ? "#BD0026"
      : d > 200
      ? "#E31A1C"
      : d > 100
      ? "#FC4E2A"
      : d > 50
      ? "#FD8D3C"
      : d > 20
      ? "#FEB24C"
      : d > 10
      ? "#FED976"
      : "#FFEDA0";
  }

  style(feature) {
    let dateData = ProcessedData[this.state.dateToDisplay];
    let featureData = dateData[feature.properties.GEOID] || {
      cases: 0,
      deaths: 0,
      casesDelta: 0,
      deathsDelta: 0,
    };

    return {
      fillColor: this.getColor(featureData.casesDelta),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const { dateToDisplay } = this.state;
    console.log(dateToDisplay);

    return (
      <div className="app">
        <Map center={position} zoom={this.state.zoom} className="map" id="map1">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={USCounties}
            style={(layer) => this.style(layer)}
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
        <div className="slider">
          <Slider
            max={this.state.dateArray.length - 1}
            min={0}
            defaultValue={0}
            onChange={(e, value) =>
              this.setState({ dateToDisplay: this.state.dateArray[value] })
            }
            valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}

export default App;
