import React, { Component } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

const supply = require('../data/supply.json');
const maxSupply = {"maxIncidents":4776,"maxIncidentsMonthly":51,"maxGrams":64702.95599999869,"maxGramsMonthly":2156.083};

const concatCode = ({ properties }) => `${properties.STATEFP}${properties.COUNTYFP}`;

export default class Map extends Component {
  constructor() {
    super();
    this.updateSvg = this.updateSvg.bind(this);
    this.fill = this.fill.bind(this);
  }

  getVal(d) {
    return d.properties.totals.incidents / maxSupply.maxIncidents;
  }

  componentWillReceiveProps(newProps) {
    console.log('received props');
    console.log(newProps);

    if (newProps.menu.type && newProps.menu.time) {
      if (
        (!this.props.menu.type || !this.props.menu.time) ||
        (
          newProps.menu.time.value !== this.props.menu.time.value ||
          newProps.menu.type.value !== this.props.menu.type.value
        )
      ) {
        // New change!
        console.log('the filter changed');
        this.repaint();
      }
    }
  }

  shouldComponentUpdate(newProps) {
    return false;
  }

  componentDidMount() {
    this.data = [
      ...supply
    ];

    this.createMap();
    this.createCounties();
  }

  createMap() {
    const position = [39, -82]
    const map = this.map = L.map(this.mapDiv).setView(position, 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.scrollWheelZoom.disable();

    // does this svg need height/width/viewbox in IE 9!?
    this.svg = d3.select(map.getPanes().overlayPane).append('svg');
    this.g = this.svg.append('g').attr('class', 'leaflet-zoom-hide');

    // let leaflet be in charge of the projection via projectPoint
    this.transform = d3.geoTransform({point: projectPoint});
    this.path = d3.geoPath().projection(this.transform);

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
  }

  createCounties() {
    this.g.append('g')
      .attr('class', 'counties')
      .selectAll('.county')
      .data(this.data, concatCode)
      .enter().append('path')
        .attr('class', 'county')
        .attr('d', this.path);

    // when leaflet zooms or pans, we need to redraw the paths
    this.map.on('zoomend', this.updateSvg);
    this.map.on('moveend', this.updateSvg);

    this.updateSvg();
    this.repaint();
  }

  updateSvg() {
    const getBounds = () => {
      let bounds;
      this.data.forEach((datum, i) => {
        if (i === 0) {
          bounds = this.path.bounds(datum);
        } else {
          var newBounds = this.path.bounds(datum);
          bounds[0][0] = bounds[0][0] < newBounds[0][0] ? bounds[0][0] : newBounds[0][0];
          bounds[0][1] = bounds[0][1] < newBounds[0][1] ? bounds[0][1] : newBounds[0][1];
          bounds[1][0] = bounds[1][0] > newBounds[1][0] ? bounds[1][0] : newBounds[1][0];
          bounds[1][1] = bounds[1][1] > newBounds[1][1] ? bounds[1][1] : newBounds[1][1];
        }
      });
      return bounds;
    }

    var bounds = getBounds();
    var topLeft = bounds[0];
    var bottomRight = bounds[1];

    // sets the viewbox so the paths are in view
    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');

    this.g.attr('transform', `translate(${-topLeft[0]},${-topLeft[1]})`);

    // redraw paths
    this.g.selectAll('path')
      .attr('d', this.path);
  }

  repaint() {
    // this.updateSvg();
    this.updateFuncs();

    const join = this.g.select('.counties')
      .selectAll('.county')
      .data(this.data, concatCode);
  
    join.exit().remove();

    join.enter().append('path')
      .attr('class', 'county')
      .merge(join)
      .attr('fill', this.fill)
      .on('click', this.props.handleCountyClick)
      .attr('d', this.path);
  }

  updateFuncs() {
    if (this.props.menu.time.value === 'sum') {
      if (this.props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.totals.incidents / maxSupply.maxIncidents;
      } else {
        this.getVal = (d) => d.properties.totals.grams / maxSupply.maxGrams;
      }
    } else {
      // monthly
      if (this.props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.timedData[this.props.currentTime].incidents / maxSupply.maxIncidentsMonthly;
      } else {
        this.getVal = (d) => d.properties.timedData[this.props.currentTime].grams/ maxSupply.maxGramsMonthly;
      }
    }
  }

  fill(d) {
    return interpolateYlOrRd(this.getVal(d));
  }

  render() {
    return (
      <div className="map-wrapper">
        <div
          className="map"
          ref={(div) => { this.mapDiv = div; }}
        />
      </div>  
    );
  }
}
