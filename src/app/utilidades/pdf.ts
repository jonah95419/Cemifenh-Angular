import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';
import { TITLE_REPORTE, FOOTER_REPORTE_DIRECCION, FOOTER_REPORTE_TELEFONO, FOOTER_REPORTE_CIUDAD, FOOTER_REPORTE_URL } from './value.const';
import { LogoClass } from './logo.service';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

const fillColor = '#F8F9FA';
const color = '#000000';
const bold = true;

export class PDFClass {

  private cabecera: any;
  private profilePic: string;
  private content = [];
  private body = [];
  private body_historico = [];
  private widths = [];
  private widths_historicos = [];
  private headers;
  private headers_historicos;
  private historico: boolean = false;

  private logoApi: LogoClass;

  constructor(private http: HttpClient) {
    this.logoApi = new LogoClass(http);
    this.logoApi.getLogo();
    this.logoApi.logo.subscribe(img => this.profilePic = img)
  }

  jojo = (datos, cabecera_data: any) => {
    this.body = [];
    this.body_historico = [];
    this.content = [];
    this.cabecera = cabecera_data;
    datos = datos.map((d: any) => { d.descripcion = d.descripcion == 'null' || d.descripcion == null ? '' : d.descripcion; return d; });
    this.establecerHeaders();
    this.cargarHeaders();
    this.cargarDatos(datos);
    this.generatePdf();
  }

  private establecerHeaders() {
    this.headers = header_abonos_y_cargos;
    this.headers_historicos = header_abonos_y_cargos_historicos;
    this.widths = ['auto', '*', 'auto', 'auto', 'auto'];
    this.widths_historicos = ['auto', '*', 'auto', 'auto'];
  }

  private cargarHeaders = () => {
    this.body_historico = [];
    this.body = [];

    for (var key in this.headers) {
      if (this.headers.hasOwnProperty(key)) {
        var header = this.headers[key];
        var row = new Array();
        header.col_1 ? row.push(header.col_1) : '';
        header.col_2 ? row.push(header.col_2) : '';
        header.col_3 ? row.push(header.col_3) : '';
        header.col_4 ? row.push(header.col_4) : '';
        header.col_5 ? row.push(header.col_5) : '';
        this.body.push(row);
      }
    }

    for (var key in this.headers_historicos) {
      if (this.headers_historicos.hasOwnProperty(key)) {
        var header = this.headers_historicos[key];
        var row = new Array();
        header.col_1 ? row.push(header.col_1) : '';
        header.col_2 ? row.push(header.col_2) : '';
        header.col_3 ? row.push(header.col_3) : '';
        header.col_4 ? row.push(header.col_4) : '';
        this.body_historico.push(row);
      }
    }
  }

  private cargarDatos(datos) {

    const border = [false, true, false, false];
    const margin = [0, 0, 0, 0];
    const alignment = 'right';

    datos = this.preprocesarDatos(datos);

    datos.forEach((s, i: number) => {

      let body = new Array(...this.body.map(c => c));
      let body_h = new Array(...this.body_historico.map(c => c));
      let h: any = [{ text: '' }, {}];

      this.historico = false;

      s.data.forEach(d => {
        let row = new Array();
        let anio = new Date(d.fecha).getFullYear() >= 2001;

        !anio ? this.historico = true : null;

        row.push({ text: d.fecha.toString(), style: 'tableContent' });
        row.push({ text: String(d.descripcion).toLowerCase(), style: 'tableContent' });

        row.push(d.cargo ? { text: this.STRNumber(d.cargo, anio), alignment, style: 'tableContent' } : "");
        row.push({ text: d.abono ? this.STRNumber(d.abono, anio) : "", alignment, style: 'tableContent', fillColor: '#eeffee' });
        anio ? row.push({ text: d.pendiente ? this.STRNumber(d.pendiente, anio) : "", alignment, style: 'tableContent' }) : null;

        if (!anio) {
          body_h.push(row);
        } else {
          body.push(row);
        }

      });

      if (this.historico) {
        h = [
          { text: 'Histórico: ', noWrap: true, bold, fillColor, color, margin: [0, 15, 0, 0] },
          {
            layout: { defaultBorder: false },
            margin: [0, 15, 0, 0],
            table: { widths: this.widths_historicos.map(c => c), body: body_h.map(h => h) }
          }
        ];
      }

      let row = new Array();
      row.push({ text: "", border });
      row.push({ text: 'Total ', alignment, bold, margin, border });
      row.push({ text: "$" + this.totalCantidadCargos(s.data), alignment, bold, margin, border });
      row.push({ text: "$" + this.totalCantidadAbonos(s.data), alignment, bold, margin, border, fillColor: '#eeffee' });
      row.push({ text: "$" + this.totalCantidadSaldo(s.data), alignment, bold, margin, border });
      body.push(row);

      this.content.push(Object.assign({}, {
        style: 'tableContent',
        layout: {
          defaultBorder: false,
        },
        table: {
          widths: ['auto', '*'],
          body: [
            [{ text: 'Sector: ', noWrap: true, bold, fillColor, color }, s.sector.toString().toUpperCase()],
            [{ text: 'Servicio: ', noWrap: true, bold, fillColor, color }, s.motivo.toString().toUpperCase()],
            [{ text: 'Tipo: ', noWrap: true, bold, fillColor, color }, s.lugar.toString().toUpperCase()],
            [{ text: 'Observaciones: ', noWrap: true, bold, fillColor, color }, s.observaciones.toString().toUpperCase()],
            [{ text: 'Movimientos: ', noWrap: true, bold, fillColor, color }, {
              layout: {
                defaultBorder: false,
              },
              table: {
                widths: Object.assign([], this.widths.map(c => c)),
                // headerRows: 1,
                dontBreakRows: true,
                body: [...Object.assign([], body.map(c => c))],
              }
            }],
            h
          ]
        }
      }));

      this.content.push(new Object({
        text: '',
        style: 'header'
      }));
    })

  }

  private preprocesarDatos(data) {
    var datos = [];

    data.forEach(e => datos.find(d => d.sitio == e.sitio) ? null : datos.push({ sitio: e.sitio, motivo: e.motivo, lugar: e.lugar, sector: e.sector, observaciones: e.observaciones, data: [] }));

    datos.forEach(s =>
      data.forEach(d => {
        if (s.sitio == d.sitio)
          s.data.push({
            cantidad: d.cantidad,
            descripcion: d.descripcion,
            estado_cuenta: d.estado_cuenta,
            fecha: d.fecha,
            pendiente: d.pendiente,
            deuda: d.deuda
          });
      })
    )

    datos.forEach(s => {
      var data = [];

      for (var i = 0; i < s.data.length; i++) {

        try {
          if (i > 0 && s.data[i].descripcion == s.data[i - 1].descripcion
            && s.data[i].fecha == s.data[i - 1].fecha
            && s.data[i].estado_cuenta != s.data[i - 1].estado_cuenta
            && s.data[i].deuda == s.data[i - 1].deuda) {

            var woman = data.find(d =>
              d.descripcion == s.data[i].descripcion
              && d.fecha == s.data[i].fecha
              && d.deuda == s.data[i].deuda
              && (d.cargo == 0 || d.abono == 0));

            var index_woman = data.indexOf(woman);

            if (data[index_woman].cargo == 0)
              data[index_woman].cargo = s.data[i].cantidad;
            else
              data[index_woman].abono = s.data[i].cantidad;

            if ((data[index_woman].pendiente == 0 || data[index_woman].pendiente == 0) && s.data[i].pendiente != 0)
              data[index_woman].pendiente = s.data[i].pendiente;

          } else {
            data.push({
              cargo: s.data[i].estado_cuenta == 'cargo' ? s.data[i].cantidad : 0,
              abono: s.data[i].estado_cuenta == 'abono' ? s.data[i].cantidad : 0,
              descripcion: s.data[i].descripcion,
              fecha: s.data[i].fecha,
              pendiente: s.data[i].pendiente,
              deuda: s.data[i].deuda
            });
          }
        } catch (error) {

        }
      }
      s.data = data;
    })

    return datos;
  }

  private getContent() {

    const espacio = {
      text: '',
      style: 'header'
    };

    let content: any = [];

    content.push({
      columns: [
        this.getProfilePicObject(),
        {
          text: TITLE_REPORTE,
          alignment: 'center',
          fontSize: 16,
        }],
      columnGap: 10
    });

    content.push(espacio);

    content.push({
      columns: [
        [{
          text: 'Emitido por: Junta parroquial',
          bold: true,
        },
        {
          text: 'Representante: ' + this.cabecera.representante,
        },
        {
          text: 'C.I./RUC: ' + this.cabecera.cedula,
        },
        {
          text: 'Observaciones: ' + '',
        }],
        [{
          text: 'Fecha emisión: ' + this.getDate(new Date()),
        },
        {
          text: 'Tipo emisión: ' + this.cabecera.tipo,
        },
        {
          text: 'Descripción: ' + this.cabecera.descripcion,
        }]
      ]
    });

    content.push(espacio);

    content.push(...JSON.parse(JSON.stringify(this.content)));

    content.push(espacio);

    return content;
  }

  private totalCantidadAbonos = (data: []): string => (Math
    .round(data
      .filter((x: any) => new Date(x.fecha) >= new Date('2001/01/01'))
      .map((x: any) => Number(x.abono))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalCantidadCargos = (data: []): string => (Math
    .round(data
      .filter((x: any) => new Date(x.fecha) >= new Date('2001/01/01'))
      .map((x: any) => Number(x.cargo))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalCantidadSaldo = (data: []): string => (Math
    .round(data
      .filter((x: any) => new Date(x.fecha) >= new Date('2001/01/01'))
      .map((x: any) => Number(x.pendiente))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private generatePdf() {
    const documentDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();
  }

  private getDocumentDefinition() {
    return {
      header: function (currentPage, pageCount) {
        return [{
          text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
          alignment: 'right',
          margin: [15, 10, 15, 20],
          fontSize: 10,
        }];
      },
      footer: {
        margin: [15, 10, 15, 20],
        columns: [
          [{ text: FOOTER_REPORTE_DIRECCION, alignment: 'center', fontSize: 8, margin: [8, 4] }],
          [{ text: FOOTER_REPORTE_TELEFONO, alignment: 'center', fontSize: 8, margin: [8, 8] }],
          [{ text: FOOTER_REPORTE_CIUDAD, alignment: 'center', fontSize: 8, margin: [8, 8] }],
          [{ text: FOOTER_REPORTE_URL, alignment: 'center', fontSize: 8, margin: [8, 8] }],
        ]
      },
      content: this.getContent(),
      info: {
        title: 'Reporte_SICDMIN',
        author: "Grupo FELENIAH",
        subject: 'SICDMIN',
        keywords: 'FELENIAH',
      },
      styles: {
        header: {
          margin: [0, 15, 0, 10]
        },
        tableContent: {
          fontSize: 11,
        },
        name: {
          fontSize: 16,
          bold: true,
          width: 'auto'
        },
        tableHeader: {
          bold: true,
          alignment: 'center',
        }
      }
    };
  }

  private getProfilePicObject() {
    if (this.profilePic) {
      return {
        image: this.profilePic,
        width: 50,
      };
    }
    return null;
  }

  private STRNumber = (cantidad: number, anio: boolean): string => (Math.round(cantidad * 100) / 100).toFixed(2).concat(anio ? '' : ' S.')

  private getDate = (fecha: Date): string => {
    fecha = new Date(fecha);
    return `${fecha.getFullYear()}-${(fecha.getMonth() + 1)}-${fecha.getDate()}`;
  }

}

const header_abonos_y_cargos = {
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', border: [false, false, false, true] },
    col_2: { text: 'Descripción', style: 'tableHeader', border: [false, false, false, true] },
    col_3: { text: 'Cargos', style: 'tableHeader', border: [false, false, false, true] },
    col_4: { text: 'Abonos', style: 'tableHeader', border: [false, false, false, true] },
    col_5: { text: 'Saldo', style: 'tableHeader', border: [false, false, false, true] }
  }
}

const header_abonos_y_cargos_historicos = {
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', border: [false, false, false, true] },
    col_2: { text: 'Descripción', style: 'tableHeader', border: [false, false, false, true] },
    col_3: { text: 'Cargos', style: 'tableHeader', border: [false, false, false, true] },
    col_4: { text: 'Abonos', style: 'tableHeader', border: [false, false, false, true] },
  }
}
