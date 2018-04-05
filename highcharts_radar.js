(function() {
  var viz = {
    id: "highcharts_radar",
    label: "Radar",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      color_range: {
        type: "array",
        label: "Color Range",
        display: "colors",
        default: ["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"],
      },
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = ""
    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!handleErrors(this, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 1, max_dimensions: 1,
        min_measures: 1, max_measures: undefined,
      })) return;

      let dimensions = queryResponse.fields.dimension_like
      let measures = queryResponse.fields.measure_like
      let measureLabels = queryResponse.fields.measure_like.map(function(measure) {return measure.label})
      let valueFormatsList = queryResponse.fields.measure_like.map(function(measure) { 
        return { 
          measure: measure.name,
          label: measure.label,
          format: measure.value_format
        }
      });

      let series = data.map(function(row, i) {
        return {
          name: row[dimensions[0].name].value, 
          pointPlacement: 'on',
          data: measures.map(function(measure) {
            return row[measure.name].value
          }),
          tooltip: {
            pointFormatter: function() {
              let category = this.category
              let valueFormat = null
              valueFormatsList.forEach(function(m) {if (category === m.label) {valueFormat = m.format}})
              let format = formatType(valueFormat)
              return `<span style="color:${this.series.color}">${this.series.name}: <b>${format(this.y)}</b><br/>`
            }
          },
        }
      })

      let options = {
        colors: config.color_range,
        credits: {
          enabled: false
        },
        chart: {
          polar: true,
          type: 'line'
        },
        title: {text: config.chartName},
        xAxis: {
          categories: measureLabels
        },
        yAxis: {
          gridLineInterpolation: 'circle',
          min: 0,
          labels: {
            format: '{value}'
          },
        },
        tooltip: {
          shared: true,
        },
        series: series,
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
