import { Component, OnInit, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { Colores } from '../../utilidades/colores';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-line-chart1',
  templateUrl: './line-chart1.component.html',
  styleUrls: ['./line-chart1.component.css']
})
export class LineChart1Component implements OnInit, OnDestroy {

  @Input()
  dataset;

  @Input()
  deudasM: number;

  @Input()
  deudasS: number;

  @Input()
  pagosM: number;

  @Input()
  pagosS: number;

  public chart;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {this.chart.destroy();}
    this.obtenerValoresChart();
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {

  }

  obtenerValoresChart(){
    const color = new Colores;
    const lista_colores = color.lista_colores();
    let cont_color = 0;
    let lista_c = [];
    let datos_chart = [];
    let colores = [];

    this.dataset.forEach((valores:any)=>{
      lista_c.push(valores.nombre);
      colores.push(lista_colores[cont_color]);
      cont_color ++;
    })

    let deudas = [];
    deudas.push(this.deudasS);
    deudas.push(this.deudasM);
    deudas.push(this.deudasS + this.deudasM);

    let pagos = [];
    pagos.push(this.pagosS);
    pagos.push(this.pagosM);
    pagos.push(this.pagosS + this.pagosM);

    const item_categoria = {
      label: 'deudas',
      data: deudas,
      backgroundColor: colores
    };

    const item_categoria2 = {
      label: 'pagos',
      data: pagos,
      backgroundColor: colores
    };

    datos_chart.push(item_categoria);
    datos_chart.push(item_categoria2);

    this.cargarChart(lista_c, datos_chart);

  }

  cargarChart(labels, data){

    const planetData = {
      labels: labels,
      datasets: data
    };

    if (this.chart) this.chart.destroy();
    this.chart = new Chart('bar-chart-1', {
      type: 'horizontalBar',
      data: planetData,
      options: {
        legend: {
          display: true
        },

        // scales: {
        //   xAxes: [{
        //     display: true,
        //     gridLines: {
        //       offsetGridLines: true
        //     },
        //     stacked: true
        //   }],
        //   yAxes: [{
        //     display:false,
        //     id: "y-axis-density"
        //     }, {
        //     id: "y-axis-gravity"
        //   }]
        // }
      }
    });

  }



}
