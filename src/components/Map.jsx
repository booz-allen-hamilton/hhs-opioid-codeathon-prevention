import React, { Component } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { interpolatePiYG } from 'd3-scale-chromatic';

const kentucky = require('../data/KY-21-kentucky-counties.json');
const ohio = require('../data/OH-39-ohio-counties.json');
const virginia = require('../data/VA-51-virginia-counties.json');
const westVirginia = require('../data/WV-54-west-virginia-counties.json');

export default class Map extends Component {
  constructor() {
    super();
    this.updateSvg = this.updateSvg.bind(this);
  }

  componentWillReceiveProps(newProps) {
    console.log('received props');
    console.log(newProps);

    if (newProps.menu.a && newProps.menu.b) {
      if (
        newProps.menu.a.value !== this.props.menu.a.value ||
        newProps.menu.b.value !== this.props.menu.b.value
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
      ...topojson.feature(kentucky, kentucky.objects.cb_2015_kentucky_county_20m).features,
      ...topojson.feature(ohio, ohio.objects.cb_2015_ohio_county_20m).features,
      ...topojson.feature(virginia, virginia.objects.cb_2015_virginia_county_20m).features,
      ...topojson.feature(westVirginia, westVirginia.objects.cb_2015_west_virginia_county_20m).features,
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
    .data(this.data, ({ properties }) => `${properties.STATEFP}-${properties.COUNTYFP}`)
    .enter().append('path')
      .attr('fill', (d) => {
        return interpolatePiYG(Math.random());
      })
      .attr('class', 'county')
      .attr('d', this.path);

    // when leaflet zooms or pans, we need to redraw the paths
    this.map.on('zoomend', this.updateSvg);
    this.map.on('moveend', this.updateSvg);

    this.updateSvg();
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
    const join = this.g.select('.counties')
      .selectAll('.county')
      .data(this.data, ({ properties }) => `${properties.STATEFP}-${properties.COUNTYFP}`);
  
    join.exit().remove();

    join.enter().append('path').attr('class', 'county')
      .merge(join)
      .attr('fill', (d) => {
        return interpolatePiYG(Math.random());
      })
      .attr('d', this.path);
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
