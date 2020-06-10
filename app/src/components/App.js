import React, { PureComponent } from "react";
import { Map, TileLayer, GeoJSON } from "react-leaflet";
import {
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import moment from "moment";
import { Timeline, Event } from "react-trivial-timeline";

import USCounties from "../data/counties.json";
import ProcessedData from "../data/processed-data-per-county.json";
import StateTimelines from "../data/state-timelines.json";

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
      selectedCountyStateFP: null,

      countyIdMap: countyIdMap,

      lat: 42.5,
      lng: -122.35,
      zoom: 4,

      dateToDisplay: Object.keys(ProcessedData)[0],
      dateRangeValue: 0,
      dateArray: [...Object.keys(ProcessedData)],

      sliderValue: 0,

      timelineDisplayed: null,
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

    if (
      this.state.timelineDisplayed === "WA" &&
      featureData.state !== "Washington"
    ) {
      return {
        fillColor: "none",
        weight: 2,
        opacity: 0,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    }

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

  formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      incidence: 0,
    };
    return (
      <div className="panel selected-county">
        <h2>{selectedCounty.NAMELSAD}</h2>
        <h3>{moment(this.state.dateToDisplay).format("ll")}</h3>
        <div className="selected-county-stat">
          <span className="label b">Total Infected: </span>
          <span className="value b">
            {this.formatNumberWithCommas(selectedCountyDateEntry.cases)}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label">Total Deaths: </span>
          <span className="value">
            {this.formatNumberWithCommas(selectedCountyDateEntry.deaths)}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label b">New Cases: </span>
          <span className="value b">
            {this.formatNumberWithCommas(selectedCountyDateEntry.casesDelta)}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label">New Deaths: </span>
          <span className="value">
            {this.formatNumberWithCommas(selectedCountyDateEntry.deathsDelta)}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label b">Infections Doubling Time (days): </span>
          <span className="value b">
            {this.formatNumberWithCommas(
              selectedCountyDateEntry.casesDoublingTimeDays
            )}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label">Deaths Doubling Time (Days): </span>
          <span className="value">
            {this.formatNumberWithCommas(
              selectedCountyDateEntry.deathsDoublingTimeDays
            )}
          </span>
        </div>
        <div className="selected-county-stat">
          <span className="label b">Total Cases per 100K People: </span>
          <span className="value b">
            {this.formatNumberWithCommas(selectedCountyDateEntry.incidence)}
          </span>
        </div>
      </div>
    );
  }

  renderWAStateTimeline() {
    return (
      <div className="timeline-container">
        <Timeline lineColor="black">
          {StateTimelines.WA.events.map((event) => {
            return (
              <Event
                interval={event.interval}
                title={event.title}
                onClick={(e) => console.log(e.target)}
                lineColor={"#94a1b2"}
              >
                {event.content}
                <div
                  className="timeline-jump-button"
                  onClick={(e) => {
                    this.setState({
                      dateToDisplay: event.date,
                      sliderValue: this.state.dateArray.indexOf(event.date),
                    });
                  }}
                >
                  Jump to date
                </div>
              </Event>
            );
          })}
        </Timeline>
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
        <div className="panel main">
          <h1>COVID-19 Infections Over Time</h1>
          <p>
            This map displays various stats for the selected date in the slider
            below. Learn more about this project{" "}
            <a
              target="#"
              href="https://github.com/DugganB/covid-temporal-analysis"
            >
              here
            </a>
          </p>
          <p>Click on a county to view all statistics for the selected date.</p>
          <div>
            <FormControl component="fieldset">
              <FormLabel component="legend" style={{ marginBottom: "0.4rem" }}>
                Display Stat:
              </FormLabel>
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
          {this.state.selectedCountyStateFP == 53 && (
            <button
              className={
                this.state.timelineDisplayed === "WA"
                  ? "timeline-button active"
                  : "timeline-button"
              }
              onClick={(e) => {
                let updatedTimeLineDisplayed =
                  this.state.timelineDisplayed === "WA" ? null : "WA";
                this.setState({
                  zoom: StateTimelines.WA.zoom,
                  lat: StateTimelines.WA.lat,
                  lng: StateTimelines.WA.long,
                  timelineDisplayed: updatedTimeLineDisplayed,
                });
              }}
            >
              {this.state.timelineDisplayed === "WA"
                ? "Hide Washington State Timeline"
                : "View Washington State Timeline"}
            </button>
          )}
          {this.state.timelineDisplayed === "WA" &&
            this.renderWAStateTimeline()}
        </div>
        <div className="map-container">
          <Map
            center={position}
            zoom={this.state.zoom}
            className="map"
            id="map1"
            zoomControl={false}
            attributionControl={false}
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
                    selectedCountyStateFP: e.target.feature.properties.STATEFP,
                  });
                });
              }}
              stroke={false}
            />
          </Map>
          {this.renderSelectedCountyPanel()}
        </div>

        <div className="panel slider">
          <div className="slider-date">
            {moment(this.state.dateToDisplay).format("ll")}
          </div>
          <Slider
            max={this.state.dateArray.length - 1}
            min={0}
            defaultValue={0}
            value={this.state.sliderValue}
            onChange={(e, value) =>
              this.setState({
                dateToDisplay: this.state.dateArray[value],
                sliderValue: value,
              })
            }
            valueLabelDisplay="off"
          />
        </div>
        <div className="panel legend">
          <h2>Legend</h2>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#800026" }}
            ></span>
            <span className="legend-text">1,000+</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#BD0026" }}
            ></span>
            <span className="legend-text">500-1,000</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#E31A1C" }}
            ></span>
            <span className="legend-text">200-500</span>
          </div>

          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#FC4E2A" }}
            ></span>
            <span className="legend-text">100-200</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#FD8D3C" }}
            ></span>
            <span className="legend-text">50-100</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#FEB24C" }}
            ></span>
            <span className="legend-text">20-50</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: "#FED976" }}
            ></span>
            <span className="legend-text">0-20</span>
          </div>
        </div>
      </div>
    );
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
      : d > 0
      ? "#FED976"
      : "none";
  }
}

export default App;
