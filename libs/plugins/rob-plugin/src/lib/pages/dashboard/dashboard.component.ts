/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
/* import { ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts'; */
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
@Component({
  templateUrl: './dashboard.Component.html',
  selector: 'rob-plugin-dashboard',
  imports: [TranslateModule],
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    this.createChartBar();
    this.createChart0();
    this.createChart();
  }

  ngAfterViewInit(): void {}

  public barChart: any;
  public chart: any;
  public pieChart: any;

  dataBar = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
  ];

  data = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
        hoverOffset: 4,
      },
    ],
  };
  data0 = {
    labels: ['error', 'warning', 'normal'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [24, 9, 6],
        backgroundColor: ['#ff0000', '#ffbb1a', '#00ab00'],
        hoverOffset: 4,
      },
    ],
  };

  createChartBar() {
    this.barChart = new Chart('barChart', {
      type: 'bar',
      data: {
        labels: this.dataBar.map((row) => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: this.dataBar.map((row) => row.count),
          },
        ],
      },
    });
  }

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'pie',
      data: this.data,
    });
  }
  createChart0() {
    this.pieChart = new Chart('pieChart', {
      plugins: [ChartDataLabels],
      type: 'pie',
      data: this.data0,
      options: {
        plugins: {
          datalabels: {
            formatter: function (value: any, context: any) {
              // return context.chart.data.labels[context.dataIndex];
              return value;
            },
            color: '#000',
            font: {
              weight: 600,
            },
          },
        },
      },
    });
  }
}
