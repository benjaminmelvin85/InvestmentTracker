import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/lwcc__chartjs_v280';

export default class HomePageChart extends LightningElement {
    @track chart;
    @track chartValue = 5;
    

    renderedCallback() {
        if (this.chart) {
            return;
        }

        Promise.all([
            loadScript(this, chartjs)
        ]).then(() => {
            this.initializeChart();
        }).catch(error => {
            console.error('Error loading chartjs library:', error);
        });
    }

    handleChange(event) {
    //   this.majorIndex = event.target.value;
      this.chartValue = parseInt(event.target.value);
      this.initializeChart();
  }

    async initializeChart() {
        const canvas = this.template.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        try {
            const apiKey;
            const apiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/%5EDJI?apikey=${apiKey}`;

            const response = await fetch(apiUrl);
            const data = await response.json();
            const historicalData = data.historical.slice(0, this.chartValue).map(item => ({
                date: item.date,
                open: item.open,
                low: item.low,
                high: item.high,
                close: item.close
            }));

            const reversedData = historicalData.reverse();

            const openValues = reversedData.map(item => item.open);
            const lowValues = reversedData.map(item => item.low);
            const highValues = reversedData.map(item => item.high);
            const closeValues = reversedData.map(item => item.close);

            const min = Math.min(...lowValues);
            const max = Math.max(...highValues);
            const stepSize = Math.ceil((max - min) / 10);
            const chartConfig = {
                type: 'line',
                data: {
                    labels: historicalData.map(item => item.date),
                    datasets: [
                        {
                            label: 'Open',
                            data: openValues,
                            borderColor: 'red',
                            borderWidth: 1,
                            fill: false
                        },
                        {
                            label: 'Low',
                            data: lowValues,
                            borderColor: 'blue',
                            borderWidth: 1,
                            fill: false
                        },
                        {
                            label: 'High',
                            data: highValues,
                            borderColor: 'green',
                            borderWidth: 1,
                            fill: false
                        },
                        {
                            label: 'Close',
                            data: closeValues,
                            borderColor: 'orange',
                            borderWidth: 1,
                            fill: false
                        },
                    ]
                },
                options: {
                    tooltips: { enabled: true },
                    hover: { mode: null },
                    interactionMode: { mode: true },
                    events: [],
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    min: min,
                                    max: max,
                                    stepSize: stepSize
                                }
                            }
                        ]
                    }
                }
            };

            this.chart = new window.Chart(ctx, chartConfig);
        } catch (error) {
            console.error('Error fetching historical stock data:', error);
        }
    }
}