import React, { PureComponent } from "react";
import { Map, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import {
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import moment from "moment";

import USCounties from "../data/counties.json";
import ProcessedData from "../data/processed-data-per-county.json";

class App extends PureComponent {
  constructor(props) {
    super(props);

    let countyIdMap = {};

    USCounties.features.forEach(
      (county) => (countyIdMap[county.properties.GEOID] = county.properties)
    );

    this.state = {
      data: {},
      selectedStat: "casesDelta",
      selectedCountyId: null,

      countyIdMap: countyIdMap,

      lat: 42.5,
      lng: -122.35,
      zoom: 4,

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

  componentDidMount() {}

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
      : d > 0
      ? "#FED976"
      : "none";
  }

  style(feature) {
    let dateData = ProcessedData[this.state.dateToDisplay];
    let featureData = dateData[feature.properties.GEOID] || {
      cases: 0,
      deaths: 0,
      casesDelta: 0,
      deathsDelta: 0,
    };

    let fillColorStat = featureData[this.state.selectedStat];
    if (this.state.selectedStat == "population") {
      fillColorStat = feature.properties.population;
    }

    return {
      fillColor: this.getColor(fillColorStat),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  }

  renderSelectedCountyPanel() {
    if (this.state.selectedCountyId === null) {
      return null;
    }

    let selectedCounty = this.state.countyIdMap[this.state.selectedCountyId];
    let selectedCountyDateEntry = ProcessedData[this.state.dateToDisplay][
      selectedCounty.GEOID
    ] || {
      dateToDisplay: "",
      cases: 0,
      deaths: 0,
      casesDelta: 0,
      deathsDelta: 0,
      casesDoublingTimeDays: "N/A",
      deathsDoublingTimeDays: "N/A",
    };
    return (
      <div className="panel selected-county">
        <h2>{selectedCounty.NAMELSAD}</h2>
        <h3>{moment(this.state.dateToDisplay).format("ll")}</h3>
        <div className="selected-county-stat">
          Total Infected: {selectedCountyDateEntry.cases}
        </div>
        <div className="selected-county-stat">
          Total Deaths: {selectedCountyDateEntry.deaths}
        </div>
        <div className="selected-county-stat">
          New Cases: {selectedCountyDateEntry.casesDelta}
        </div>
        <div className="selected-county-stat">
          New Deaths: {selectedCountyDateEntry.deathsDelta}
        </div>
        <div className="selected-county-stat">
          Infections Doubling Time (days):{" "}
          {selectedCountyDateEntry.casesDoublingTimeDays}
        </div>
        <div className="selected-county-stat">
          Deaths Doubling Time (Days):{" "}
          {selectedCountyDateEntry.deathsDoublingTimeDays}
        </div>
        <div className="selected-county-stat">
          Total Cases per 100K People: {selectedCountyDateEntry.incidence}
        </div>
      </div>
    );
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const { dateToDisplay } = this.state;

    let mapBoxAccessToken =
      "pk.eyJ1IjoiZHVnZ2FuYiIsImEiOiJja2EzZ2kzdXIwYW0zM3ByMTZhbWpoa3JpIn0.8YGDcahjoYyg1hDNDRF0jQ";

    return (
      <div className="app">
        <Map
          center={position}
          zoom={this.state.zoom}
          className="map"
          id="map1"
          zoomControl={false}
        >
          <TileLayer
            url={
              `https://api.mapbox.com/styles/v1/dugganb/ckan8109p5i6c1jnssjfmbr0q/tiles/{z}/{x}/{y}?access_token=` +
              mapBoxAccessToken
            }
            tileSize={512}
            zoomOffset={-1}
          />
          <GeoJSON
            data={USCounties}
            style={(layer) => this.style(layer)}
            smoothFactor={0.25}
            onEachFeature={(feature, layer, test) => {
              layer.on("mouseover", (e) => {
                e.target.setStyle({ stroke: true });
              });
              layer.on("mouseout", (e) => {
                if (
                  e.target.feature.properties.GEOID !==
                  this.state.selectedCountyId
                ) {
                  e.target.setStyle({ stroke: false });
                }
              });
              layer.on("mousedown", (e) => {
                //Looking for the layer key that leaflet uses to keep track of layers
                let previouslySelectedLayerKey = Object.keys(
                  e.target._map._layers
                ).find((layerKey) => {
                  let layer = e.target._map._layers[layerKey];
                  if (layer.feature === undefined) {
                    return false;
                  }
                  return (
                    layer.feature.properties.GEOID ===
                    this.state.selectedCountyId
                  );
                });
                let previouslySelectedLayer =
                  e.target._map._layers[previouslySelectedLayerKey];

                // If newly clicked layer is different, set the style of the old layer to not be selected
                if (
                  previouslySelectedLayer !== undefined &&
                  this.state.selectedCountyId !==
                    e.target.feature.properties.GEOID
                ) {
                  previouslySelectedLayer.setStyle({ stroke: false });
                }
                this.setState({
                  selectedCountyId: e.target.feature.properties.GEOID,
                  selectedCountyRef: React.createRef(),
                });
              });
            }}
            stroke={false}
          />
        </Map>
        <div className="panel main">
          <h1>COVID-19 Infections Over Time</h1>
          <p>
            This map displays various stats for the selected date in the slider
            below.
          </p>
          <p>Click on a county to view all statistics for the selected date.</p>
          <div>
            <FormControl component="fieldset">
              <FormLabel component="legend">Display Stat:</FormLabel>
              <RadioGroup
                aria-label="Display Statistic"
                name="displayStat"
                value={this.state.selectedStat}
                onChange={(e) =>
                  this.setState({ selectedStat: e.target.value })
                }
              >
                <FormControlLabel
                  value="cases"
                  control={<Radio classes={{ root: "radio-control" }} />}
                  label="Total Cases"
                />
                <FormControlLabel
                  value="deaths"
                  control={<Radio classes={{ root: "radio-control" }} />}
                  label="Total Deaths"
                />
                <FormControlLabel
                  value="casesDelta"
                  control={<Radio classes={{ root: "radio-control" }} />}
                  label="Day's New Cases"
                />
                <FormControlLabel
                  value="deathsDelta"
                  control={<Radio />}
                  label="Day's New Deaths"
                />
                <FormControlLabel
                  value="casesDoublingTimeDays"
                  control={<Radio />}
                  label="Cases Doubling Time (Days)"
                />
                <FormControlLabel
                  value="deathsDoublingTimeDays"
                  control={<Radio />}
                  label="Deaths Doubling Time (Days)"
                />
                <FormControlLabel
                  value="incidence"
                  control={<Radio />}
                  label="Total cases per 100k people"
                />
              </RadioGroup>
            </FormControl>
          </div>
        </div>
        {this.renderSelectedCountyPanel()}
        <div className="panel slider">
          <div className="slider-date">
            {moment(this.state.dateToDisplay).format("ll")}
          </div>
          <Slider
            max={this.state.dateArray.length - 1}
            min={0}
            defaultValue={0}
            onChange={(e, value) =>
              this.setState({ dateToDisplay: this.state.dateArray[value] })
            }
            valueLabelDisplay="off"
          />
        </div>
      </div>
    );
  }
}

export default App;
