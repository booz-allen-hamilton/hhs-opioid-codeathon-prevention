import React, { Component } from 'react';
import L from 'leaflet';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';
import moment from 'moment';
import { concatCode, radiusScale, colorScale } from '../utilities';

const demand = require('../data/demand.json');
const predictSupply = require('../data/predict-supply.json');
const narcan = require('../data/narcan.json');

const maxSupply = {
  "maxIncidents":398,
  "maxIncidentsMonthly":51,
  "maxGrams":5391.91300000001,
  "maxGramsMonthly":2156.083,
  "maxSocial":6000,
  "maxSocialMonthly":500
};

const MIN_LOG_VALUE = 0.001;

const NARCAN_SCALE = 100;
const MAX_NARCAN = 350;

const WIDTH = document.body.clientWidth;

export default class Map extends Component {
  constructor() {
    super();
    this.updateSvg = this.updateSvg.bind(this);
    this.fill = this.fill.bind(this);
    this.countyClick = this.countyClick.bind(this);
    this.countyTip = this.countyTip.bind(this);

    this.label = 'incidents';
  }

  getVal(d) {
    return d.properties.totals.incidents / maxSupply.maxIncidents;
  }

  shouldComponentUpdate(newProps) {
    this.label = newProps.menu.type.label;
    this.newProps = newProps;

    if (newProps.supply && !this.props.supply) {
      this.data = newProps.supply;
      this.begin();
      return false;
    }

    if (!this.props.supply) {
      return false;
    }

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
    if (newProps.investigate && (!this.props.investigate || newProps.county !== this.props.county)) {
      this.flyTo(newProps.county);
      this.showInfoDiv(newProps.county);
      this.calcFlows(newProps.county);
    } else if (this.props.investigate && !newProps.investigate) {
      const lng = this.props.menu.collapsed ? -84 : -82;
      this.map.setView([39, lng], 7);
      d3.select(this.infoDiv).classed('hidden', true);
      this.stopFlows();
    }

    return false;
  }

  begin() {
    this.createMap();
    this.createCounties();
    this.createLegend();
    this.createFlowLegend();
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
    const counties = this.g.append('g')
      .attr('class', 'counties')
      .selectAll('.county')
      .data(this.data, concatCode)
      .enter().append('path')
        .attr('class', 'county')
        .on('mouseover', this.countyTip)
        .attr('d', this.path);

    // when leaflet zooms or pans, we need to redraw the paths
    this.map.on('zoomend', this.updateSvg);
    this.map.on('moveend', this.updateSvg);

    this.updateSvg();
    this.repaint(this.newProps);

    const nodes = counties.nodes();
    const node = nodes[58];
    this.countyClick(this.data[58], 58, nodes)

  }

  countyTip(d) {
    console.log(concatCode(d));
  }

  createLegend() {
    const sequence = d3.scaleSequential(d3.interpolateInferno)
      .domain([this.legendMax, 0]);

    d3.select(this.legendDiv).selectAll('*').remove();
    const svg = d3.select(this.legendDiv).append('svg');

    svg.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .text(this.label);

    svg.append('g')
      .attr('class', 'legend-1')
      .attr('transform', 'translate(20,60)');

    const legendLinear = d3Legend.legendColor()
      .shapeWidth(30)
      .cells(6)
      .orient('vertical')
      .scale(sequence);

    svg.select('.legend-1')
      .call(legendLinear);
  }

  createFlowLegend() {
    const svg = d3.select(this.flowLegendDiv).append('svg')
      .attr('width', 300)
      .attr('height', 400)

    const text = [
      'low',
      'medium',
      'high',
      'very high',
    ];

    const gs = svg.selectAll('.legend-item')
      .data([25, 100, 500, 2500])
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(30, ${165 - 44 * i})`);

    gs.append('circle')
      .attr('r', radiusScale)
      .attr('fill', colorScale)

    gs.append('text')
      .attr('x', 30)
      .attr('y', 6)
      .text((d, i) => text[i])
  }

  createLineLegend() {
    const ordinalScale = d3.scaleOrdinal(['#007BFF', '#868e96', '#dc3545', '#ffc107'])
      .domain(['incidents', 'supply', 'demand', 'naloxone']);

    const svg = d3.select('.line-legend');
    svg.selectAll('*').remove();

    svg.append('g')
      .attr('class', 'legend-2')
      .attr('transform', 'translate(50,10)');

    const legendOrdinal = d3Legend.legendColor()
      .shapeWidth(30)
      .cells(2)
      .shapePadding(60)
      .orient('horizontal')
      .scale(ordinalScale);

    svg.select('.legend-2')
      .call(legendOrdinal);
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

    if (this.flowing) {
      this.calcFlows(this.county);
    }
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
    // debugger;

    if (props.menu.time.value === 'sum') {
      if (props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.totals.incidents / maxSupply.maxIncidents;
        this.legendMax = maxSupply.maxIncidents;
        d3.select(this.legendDiv).attr('class', 'legend legend-div medium');
      } else if (props.menu.type.value === 'social') {
        this.getVal = (d) => d.properties.totals.social / maxSupply.maxSocial;
        this.legendMax = maxSupply.maxSocial;
        d3.select(this.legendDiv).attr('class', 'legend legend-div large');
      } else {
        this.getVal = (d) => d.properties.totals.grams / maxSupply.maxGrams;
        this.legendMax = maxSupply.maxGrams;
        d3.select(this.legendDiv).attr('class', 'legend legend-div large');
      }
    } else {
      // monthly
      if (props.menu.type.value === 'incidents') {
        this.getVal = (d) => d.properties.timedData[props.currentTime].incidents / maxSupply.maxIncidentsMonthly;
        this.legendMax = maxSupply.maxIncidentsMonthly;
        d3.select(this.legendDiv).attr('class', 'legend legend-div smaller');
      } else if (props.menu.type.value === 'social') {
        this.getVal = (d) => d.properties.timedData[props.currentTime].social / maxSupply.maxSocialMonthly;
        this.legendMax = maxSupply.maxSocialMonthly;
        d3.select(this.legendDiv).attr('class', 'legend legend-div large');
      } else {
        this.getVal = (d) => d.properties.timedData[props.currentTime].grams/ maxSupply.maxGramsMonthly;
        this.legendMax = maxSupply.maxGramsMonthly;
        d3.select(this.legendDiv).attr('class', 'legend legend-div medium');
      }
    }
  }

  fill(d) {
    return d3.interpolateInferno(1 - this.getVal(d));
  }

  countyClick(d, i, nodes) {
    this.county = d;

    d3.select('.counties').selectAll('.county')
      .classed('active', false);
    d3.select(nodes[i]).classed('active', true);

    this.props.handleCountyClick(d, i, nodes);
  }

  flyTo(county) {
    const newCoords = this.getCentroid(county);

    // WIDTH
    const xOffset = ((WIDTH / 1440) ** 1.2) * 1.5;

    this.map.setView({
      lat: newCoords.lat + 0.1,
      lng: newCoords.lng + xOffset,
    }, 9);
  }

  showInfoDiv(county) {
    const renderInfoDiv = (county) => `
      <div class="panel">
        <button class="btn btn-success">Model</button>
        <h3>${county.properties.NAME} County</h3>
        <svg class="line-legend" />
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
      width: bbox.width - 160,
      height: bbox.height - 50,
    }

    this.chart.svg = d3.select(this.infoDiv).select('.chart > svg')
      .attr('width', this.chart.width + 160)
      .attr('height', this.chart.height + 50);

    this.makeChart(county);
    this.createLineLegend();
  }

  makeChart(county) {
    const margin = {
      top: 25,
      right: 80,
    };

    const { chart } = this;
    const { width, height } = chart;
    const code = concatCode(county);

    county.data = this.props.menu.menuOptions.type.slice(0, 2).map(type => {
      return Object.keys(county.properties.timedData).map(key => ({
        date: moment(key),
        value: type.log ? d3.max([MIN_LOG_VALUE, county.properties.timedData[key][type.value]]) : county.properties.timedData[key][type.value],
      }))
    });
    // [
    //   {date: moment('2015-01-01'), value: 1.5},
    // ]

    const supplyData = predictSupply.filter(d => d.fips === code);
    county.supplyPredict = supplyData.map(d => ({
      date: moment(d.date, 'M/D/YY'),
      value: d3.max([MIN_LOG_VALUE, Number(d.quantity)]),
    }));

    county.data[1] = [...county.data[1], ...county.supplyPredict];

    const xDomain = [
      moment('2015-01'),
      moment('2016-04'),
    ];

    chart.x = d3.scaleTime().range([0, width]);
    chart.x.domain(xDomain);

    chart.y = [];
    chart.yAxis = [];
    chart.line = [];

    chart.y[0] = d3.scaleLinear().range([height, 0]);
    chart.y[0].domain([0, d3.max(county.data[0], d => d.value)]).nice();

    chart.y[1] = d3.scaleLog().range([height, 0]);
    chart.y[1].domain([0.001, d3.max(county.data[1], d => d.value)]).nice();

    chart.xAxis = d3.axisBottom(chart.x)
      .tickSize(5)
    chart.yAxis[0] = d3.axisLeft(chart.y[0])
      .ticks(4);
    chart.yAxis[1] = d3.axisRight(chart.y[1])
      .ticks(5, '3,');

    chart.line[0] = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => chart.x(d.date))
      .y(d => chart.y[0](d.value));

    chart.line[1] = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => chart.x(d.date))
      .y(d => chart.y[1](d.value));


    chart.g = this.chart.svg.append('g')
      .attr('transform', `translate(${margin.right},${margin.top})`);

    chart.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${chart.height})`)
      .call(chart.xAxis);

    chart.g.selectAll('.x.axis > tick text')
      .attr('transform', 'translate(0, 5');

    chart.g.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(0,0)`)
      .call(chart.yAxis[0]);

    chart.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `rotate(-90, ${-margin.right / 2 + 15}, ${chart.height/2})`)
      .attr('x', -margin.right / 2 + 15)
      .attr('y', chart.height / 2)
      .text(this.props.menu.menuOptions.type[0].axisLabel);

    chart.g.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${chart.width},0)`)
      .call(chart.yAxis[1]);

    chart.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `rotate(-90, ${chart.width + margin.right}, ${chart.height/2})`)
      .attr('x', chart.width + margin.right)
      .attr('y', chart.height / 2)
      .text(this.props.menu.menuOptions.type[1].axisLabel);

    chart.g.selectAll('.line')
      .data(county.data)
      .enter()
      .append('path')
        .attr('class', (d, i) => `line line-${i}`)
        .attr('d', (d, i) => chart.line[i](d));

    const demandData = demand.filter(d => d.fips === code);

    if (demandData.length) {
      chart.y[2] = d3.scaleLinear().range([height, 0]);

      chart.line[2] = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => chart.x(d.date))
        .y(d => chart.y[2](d.value));

      let min = 1;
      let max = 0;
      county.demand = demandData.map(d => {
        min = Number(d.quantity) < min ? Number(d.quantity) : min;
        max = Number(d.quantity) > max ? Number(d.quantity) : max;
        return {
          date: moment(d.date),
          value: Number(d.quantity),
        }
      });

      if ( min === max ) {
        min = min - 0.1;
        max = max + 0.1;
      }

      chart.y[2].domain([min, max]).nice();

      chart.g.append('path')
        .attr('class', 'line line-2')
        .attr('d', chart.line[2](county.demand));
    }

    const narcanData = narcan.filter(d => d.fips === code);

    if (narcanData.length) {
      chart.y[3] = d3.scaleLinear().range([height, 0]);

      chart.line[3] = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => chart.x(d.date))
        .y(d => chart.y[3](d.value));

      let max = 0;
      county.narcan = narcanData.map(d => {
        max = max < Number(d.quantity) / NARCAN_SCALE ? Number(d.quantity) / NARCAN_SCALE : max; 
        return {
          date: moment(d.date),
          value: Number(d.quantity) / NARCAN_SCALE,
        }
      });

      chart.y[3].domain([0, max]).nice();

      chart.g.append('path')
        .attr('class', 'line line-3')
        .attr('d', chart.line[3](county.narcan));

      chart.yAxis[3] = d3.axisLeft(chart.y[3])
        .ticks(4);

      chart.g.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(-45,0)`)
        .call(chart.yAxis[3]);

      chart.g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `rotate(-90, ${-margin.right / 2 - 35}, ${chart.height/2})`)
        .attr('x', -margin.right / 2 - 35)
        .attr('y', chart.height / 2)
        .text('naloxone');
    }

    this.chart.width0 = chart.x(moment('2015-12'));
    this.chart.width1 = chart.x(moment('2016-04'));


    chart.curtain0 = chart.g.append('rect')
      .attr('x', -1 * this.chart.width0 - 1)
      .attr('y', -1 * chart.height + 1)
      .attr('height', chart.height)
      .attr('width', this.chart.width0)
      .attr('class', 'curtain curtain-0')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff')

    chart.curtain1 = chart.g.append('rect')
      .attr('x', -1 * this.chart.width1)
      .attr('y', -1 * chart.height + 1)
      .attr('height', chart.height)
      .attr('width', (this.chart.width1 - this.chart.width0))
      .attr('class', 'curtain curtain-1')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff')
  }

  animate() {
    const t = d3.transition()
      .duration(3000)
      .ease(d3.easeLinear);

    const t2 = d3.transition()
      .duration(5000)
      .delay(3000)
      .ease(d3.easeLinear);

    d3.select('rect.curtain-1')
      .attr('width', (this.chart.width1 - this.chart.width0))

    d3.select('rect.curtain-0')
      .attr('width', this.chart.width0)
      .transition(t)
        .attr('width', 0)
        .on('end', () => {
          d3.select('rect.curtain-1')
            .transition(t2)
              .attr('width', 0);
        });
  }

  calcFlows(county) {
    this.stopFlows();

    const { flow } = county.properties.timedData[this.props.currentTime];
    const fips = concatCode(county);

    const centroid = this.getCentroid(county);

    const flowFrom = flow.filter(d => d.from === fips);
    const flowTo = flow.filter(d => d.to === fips);

    const flowData = [
      ...flowFrom.map(flow => {
        const latLng2 = this.getLatLng(flow.to);
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [centroid.lng, centroid.lat],
              [latLng2.lng, latLng2.lat],
            ]
          },
          properties: {
            flow: flow.flow,
          }
        };
      }),
      ...flowTo.map(flow => {
        const latLng1 = this.getLatLng(flow.from);
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [latLng1.lng, latLng1.lat],
              [centroid.lng, centroid.lat],
            ]
          },
          properties: {
            flow: flow.flow,
          }
        };
      }),
    ];

    this.flowing = true;
    this.plotFlows(flowData);
  }

  plotFlows(data) {
    const pathStartPoint = (path) => {
      return path.attr('d').split('L')[0].slice(1).split(',').map(Number);
    }

    const pathEndPoint = (path) => {
      return path.attr('d').split('L')[1].split(',').map(Number);
    }

    // draw some PATHS!!!
    const paths = this.g.append('g')
      .attr('class', 'flows')
      .selectAll('.flow')
      .data(data)
      .enter().append('path')
        .attr('class', 'flow')
        .attr('d', this.path);

    paths.each((d, i, nodes) => {
      const transition = () => {
        marker.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attrTween('transform', translateAlong(d3.select(nodes[i])))
          .on('end', transition);
      }

      const translateAlong = (path) => {
        return (i) => (t) => {
          const p = [
            t * endPoint[0] + (1 - t) * startPoint[0],
            t * endPoint[1] + (1 - t) * startPoint[1],
          ];
          return `translate(${p})`;
        }
      } 

      const startPoint = pathStartPoint(d3.select(nodes[i]));
      const endPoint = pathEndPoint(d3.select(nodes[i]));

      const marker = d3.select('.flows').append('circle')
        .attr('r', radiusScale(d.properties.flow))
        .attr('fill', colorScale(d.properties.flow))
        .attr('transform', `translate(${startPoint})`);

      transition();
    })

  }

  stopFlows() {
    d3.select('.flows').remove();
    this.flowing = false;
  }

  getLatLng(fips) {
    const county = this.data.find(d => concatCode(d) === fips);

    return this.getCentroid(county);
  }

  getCentroid(county) {
    const coords1 = county.geometry.coordinates[0][0];
    const index2 = Math.floor(county.geometry.coordinates[0].length / 2);
    const coords2 = county.geometry.coordinates[0][index2];
    return {
      lat: (coords1[1] + coords2[1]) / 2,
      lng: (coords1[0] + coords2[0]) / 2
    };
  }

  render() {
    return (
      <div className="map-wrapper">
        <div
          className="map"
          ref={(div) => { this.mapDiv = div; }}
        />
        <div
          className="legend-div legend"
          ref={(div) => { this.legendDiv = div; }}
        />
        <div
          className="flow-legend-div legend"
          ref={(div) => { this.flowLegendDiv = div;}}
        />
        <div
          className="info-div hidden"
          ref={(div) => { this.infoDiv = div; }}
        />
      </div>  
    );
  }
}
