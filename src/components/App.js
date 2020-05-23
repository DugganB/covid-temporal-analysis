import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";

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
  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <div className="app" id="mapid">
        <Map center={position} zoom={this.state.zoom} className="map">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </Map>
      </div>
    );
  }
}

export default App;
