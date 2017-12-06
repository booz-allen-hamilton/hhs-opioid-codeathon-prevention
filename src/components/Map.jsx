import React, { Component } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';
import moment from 'moment';
// import { interpolateYlOrRd } from 'd3-scale-chromatic';

const supply = require('../data/supply.json');
const maxSupply = {"maxIncidents":4776,"maxIncidentsMonthly":51,"maxGrams":64702.95599999869,"maxGramsMonthly":2156.083};

const concatCode = ({ properties }) => `${properties.STATEFP}${properties.COUNTYFP}`;

export default class Map extends Component {
  constructor() {
    super();
    this.updateSvg = this.updateSvg.bind(this);
    this.fill = this.fill.bind(this);
    this.countyClick = this.countyClick.bind(this);
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
      } else if (
          (newProps.currentTime !== this.props.currentTime) && 
          newProps.menu.time && newProps.menu.time.value === 'monthly'
        ) {
        this.repaint(newProps);
      }
    }
    if (newProps.menu.collapsed !== this.props.menu.collapsed) {
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
    if (newProps.investigate) {
      this.flyTo(newProps.county);
      this.showInfoDiv(newProps.county);
    } else if (this.props.investigate) {
      const lng = this.props.menu.collapsed ? -84 : -82;
      this.map.setView([39, lng], 7);
      d3.select(this.infoDiv).classed('hidden', true);
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
    const sequence = d3.scaleSequential(d3.interpolateInferno)
      .domain([this.legendMax, 0]);

    d3.select(this.legendDiv).selectAll('*').remove();
    const svg = d3.select(this.legendDiv).append('svg');

    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20,20)');

    const legendLinear = d3Legend.legendColor()
      .shapeWidth(30)
      .cells(8)
      // .labelOffset(-50)
      // .shapePadding(10)
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
      .on('click', this.countyClick)
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
    return d3.interpolateInferno(1 - this.getVal(d));
  }

  countyClick(d, i, nodes) {
    d3.select('.counties').selectAll('.county')
      .classed('active', false);
    d3.select(nodes[i]).classed('active', true);

    this.props.handleCountyClick(d, i, nodes);
  }

  flyTo(county) {
    const coords1 = county.geometry.coordinates[0][0];
    const index2 = Math.floor(county.geometry.coordinates[0].length / 2);
    const coords2 = county.geometry.coordinates[0][index2];
    const newCoords = {
      lat: (coords1[1] + coords2[1]) / 2 + 0.1,
      lng: (coords1[0] + coords2[0]) / 2 + 0.4
    };

    this.map.setView(newCoords, 9.5);
  }

  showInfoDiv(county) {
    console.log('show info', county);

    const renderInfoDiv = (county) => `
      <div class="panel">
        <button class="btn btn-success">Model</button>
        <h3>${county.properties.NAME} County</h3>
      </div>
      <div class="chart">
        <svg />
      </div>
    `;

    d3.select(this.infoDiv)
      .classed('hidden', false)
      .html(renderInfoDiv(county));

    d3.select('.panel > button').on('click', this.animate.bind(this))

    const bbox = d3.select(this.infoDiv).select('.chart').node().getBoundingClientRect();
    this.chart = {
      width: bbox.width - 60,
      height: bbox.height - 60
    }

    this.chart.svg = d3.select(this.infoDiv).select('.chart > svg')
      .attr('width', this.chart.width + 60)
      .attr('height', this.chart.height + 60);

    this.makeChart(county);
  }

  makeChart(county) {
    const margin = 30;
    const { chart } = this;
    const { width, height } = chart;

    county.data = Object.keys(county.properties.timedData).map(key => ({
      date: moment(key),
      value: county.properties.timedData[key].incidents,
    }));

    debugger;

    // [
    //   {date: moment('2015-01-01'), value: 1.5},
    //   {date: moment('2015-02-01'), value: 1.7},
    //   {date: moment('2015-03-01'), value: 1.8},
    //   {date: moment('2015-04-01'), value: 1.6},
    //   {date: moment('2015-05-01'), value: 1.4},
    //   {date: moment('2015-06-01'), value: 1.2},
    //   {date: moment('2015-07-01'), value: 1.5},
    //   {date: moment('2015-08-01'), value: 1.7},
    //   {date: moment('2015-09-01'), value: 1.9},
    //   {date: moment('2015-10-01'), value: 2.1},
    //   {date: moment('2015-11-01'), value: 1.9},
    //   {date: moment('2015-12-01'), value: 1.7},
    // ]

    chart.x = d3.scaleTime().range([0, width]);
    chart.y = d3.scaleLinear().range([height, 0]);

    chart.xAxis = d3.axisBottom(chart.x)
      .tickSize(5)
    chart.yAxis = d3.axisRight(chart.y)
      .ticks(4);

    chart.area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(d => d.date)
      .y0(height)
      .y1(d => d.value );

    chart.line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => chart.x(d.date))
      .y(d => chart.y(d.value));

    chart.x.domain([county.data[0].date, county.data[county.data.length - 1].date]);
    chart.y.domain([0, d3.max(county.data, d => d.value)]).nice();

    chart.g = this.chart.svg.append('g')
      .attr('transform', `translate(${margin},${margin})`);

    chart.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${chart.height})`)
      .call(chart.xAxis);

    chart.g.selectAll('.x.axis > tick text')
      .attr('transform', 'translate(0, 5');

    chart.g.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${width},0)`)
      .call(chart.yAxis);

    chart.g.selectAll('.line')
      .data([county.data])
      .enter()
      .append('path')
        .attr('class', 'line')
        .attr('d', chart.line);

    chart.curtain = chart.g.append('rect')
      .attr('x', -1 * chart.width)
      .attr('y', -1 * chart.height)
      .attr('height', chart.height)
      .attr('width', chart.width)
      .attr('class', 'curtain')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff')
  }

  animate() {
    d3.select('rect.curtain')
      .attr('width', this.chart.width);
    const t = d3.transition()
    .duration(1500)
    .ease(d3.easeLinear);

    d3.select('rect.curtain').transition(t)
      .attr('width', 0);
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
        <div
          className="info-div hidden"
          ref={(div) => { this.infoDiv = div; }}
        />
      </div>  
    );
  }
}
