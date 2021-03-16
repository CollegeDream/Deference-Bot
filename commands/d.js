{
    "type": "bar",
    "data": {
      "labels": [
        new Date(2020, 5, 14),
        new Date(2020, 5, 15),
        new Date(2020, 5, 16),
        new Date(2020, 5, 17),
        new Date(2020, 5, 18),
        new Date(2020, 5, 19),
        new Date(2020, 5, 20)
      ],
      "datasets": [
        {
          "type": "bar",
          "label": "Dataset 1",
          "backgroundColor": "rgba(255, 99, 132, 0.5)",
          "borderColor": "rgb(255, 99, 132)",
          "data": [
            -1,
            44,
            -51,
            -2,
            75,
            62,
            43
          ]
        },
        {
          "type": "bar",
          "label": "Dataset 2",
          "backgroundColor": "rgba(54, 162, 235, 0.5)",
          "borderColor": "rgb(54, 162, 235)",
          "data": [
            5,
            68,
            19,
            -57,
            -79,
            37,
            -24
          ]
        },
        {
          "type": "line",
          "label": "Dataset 3",
          "backgroundColor": "rgba(2, 192, 192, 0.5)",
          "borderColor": "rgb(75, 192, 192)",
          "fill": true,
          "fillColor": "rgb(0, 0, 0)",
          "data": [
            -35,
            33,
            -49,
            2,
            68,
            35,
            -16
          ]
        }
      ]
    },
    "options": {
      "title": {
        "text": "Chart.js Combo Time Scale"
      },
      "scales": {
        "xAxes": [{
          "type": "time",
          "display": true,
          "offset": false,
          "time": {
            "unit": "day"
          }
        }]
      }
    }
  }