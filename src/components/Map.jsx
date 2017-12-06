import React, { Component } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';
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

  shouldComponentUpdate(newProps) {
    if (newProps.menu.type && newProps.menu.time) {
      if (
        (!this.props.menu.type || !this.props.menu.time) || (
          newProps.menu.time.value !== this.props.menu.time.value ||
          newProps.menu.type.value !== this.props.menu.type.value
        )
      ) {
        // New change!
        this.repaint(newProps);
      } else if ((newProps.currentTime !== this.props.currentTime) && newProps.menu.time && newProps.menu.time.value === 'monthly') {
        this.repaint(newProps);
      }
    }
    if (newProps.menu.collapsed !== this.props.menu.collapsed) {
      console.log('changing');

      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      if (zoom === 7) {
        if (newProps.menu.collapsed) {
          this.map.setView([center.lat, center.lng - 2], zoom, {animate: false});
        } else {
          this.map.setView([center.lat, center.lng + 2], zoom, {animate: false});
        }
      }
    }
    return false;
  }

  componentDidMount() {
    this.data = [
      ...supply
    ];

    this.createMap();
    this.createCounties();
    this.createLegend();
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
    this.repaint(this.props);
  }

  createLegend() {
    const sequence = d3.scaleSequential(interpolateYlOrRd)
      .domain([0, this.legendMax]);

    d3.select(this.legendDiv).selectAll('*').remove();
    const svg = d3.select(this.legendDiv).append('svg');

    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20,20)');

    const legendLinear = d3Legend.legendColor()
      .shapeWidth(30)
      .cells(6)
      .orient('vertical')
      .scale(sequence);

    svg.select('.legend')
      .call(legendLinear);
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

  repaint(props) {
    this.updateFuncs(props);
    this.createLegend();

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

  updateFuncs(props) {
    if (props.menu.time.value === 'sum') {
      if (props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.totals.incidents / maxSupply.maxIncidents;
        this.legendMax = maxSupply.maxIncidents;
        d3.select(this.legendDiv).attr('class', 'legend-div medium');
      } else {
        this.getVal = (d) => d.properties.totals.grams / maxSupply.maxGrams;
        this.legendMax = maxSupply.maxGrams;
        d3.select(this.legendDiv).attr('class', 'legend-div large');
      }
    } else {
      // monthly
      if (props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.timedData[props.currentTime].incidents / maxSupply.maxIncidentsMonthly;
        this.legendMax = maxSupply.maxIncidentsMonthly;
        d3.select(this.legendDiv).attr('class', 'legend-div smaller');
      } else {
        this.getVal = (d) => d.properties.timedData[props.currentTime].grams/ maxSupply.maxGramsMonthly;
        this.legendMax = maxSupply.maxGramsMonthly;
        d3.select(this.legendDiv).attr('class', 'legend-div medium');
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
        <div
          className="legend-div"
          ref={(div) => { this.legendDiv = div; }}
        />
      </div>  
    );
  }
}
