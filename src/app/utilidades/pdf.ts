import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export class PDFClass {

  private cabecera: any;
  private profilePic: string;
  private body = [];
  private body_historico = [];
  private widths = [];
  private widths_historicos = [];
  private headers;
  private headers_historicos;
  private historico: boolean = false;
  private headersRows: number = 2;

  constructor(private http: HttpClient) {
    this.getLogo();
  }

  jojo = (datos, opcion_pdf: string, cabecera_data: any, tipo: string) => {
    this.cabecera = cabecera_data;
    this.establecerHeaders(tipo);
    this.cargarHeaders(tipo);
    this.cargarDatos(datos, opcion_pdf, tipo);
  }

  private cargarDatos(datos: [], opcion_pdf: string, tipo: string) {
    this.historico = false;
    datos.forEach((d: any) => {
      var row = new Array();
      var anio = new Date(d.fecha).getFullYear() >= 2001;

      !anio ? this.historico = true : null;

      if (tipo === 'abonos_y_cargos') {
        row.push({ text: d.fecha.toString(), fontSize: 10 });
        row.push({ text: d.lugar.toString(), fontSize: 10 });
        row.push({ text: d.motivo.toString(), fontSize: 10 });
        row.push({ text: d.sector.toString(), fontSize: 10 });
        row.push({ text: String(d.descripcion).toLowerCase(), fontSize: 10 });
        if (d.estado_cuenta === 'cargo') {
          row.push({ text: (Math.round(d.cantidad * 100) / 100).toFixed(2).concat(anio ? '' : ' S.'), alignment: 'right', fontSize: 10 });
          row.push("");
          anio ? row.push({ text: d.pendiente <= 0 ? 'pagado' : (Math.round(d.pendiente * 100) / 100).toFixed(2), alignment: 'right', fontSize: 10 }) : null;
        } else {
          row.push("");
          row.push({ text: (Math.round(d.cantidad * 100) / 100).toFixed(2).concat(anio ? '' : ' S.'), alignment: 'right', fontSize: 10 });
          anio ? row.push("") : null;
        }
      }

      if (tipo === 'abono' || tipo === 'cargo') {
        row.push({ text: d.fecha.toString(), fontSize: 10 });
        row.push({ text: d.lugar.toString(), fontSize: 10 });
        row.push({ text: d.motivo.toString(), fontSize: 10 });
        row.push({ text: d.sector.toString(), fontSize: 10 });
        row.push({ text: String(d.descripcion).toLowerCase(), fontSize: 10 });
        row.push({ text: (Math.round(d.cantidad * 100) / 100).toFixed(2).concat(anio ? '' : ' S.'), alignment: 'right', fontSize: 10 });
        if (tipo === 'cargo' && anio) {
           row.push({ text: d.pendiente <= 0 ? 'pagado' : (Math.round(d.pendiente * 100) / 100).toFixed(2), alignment: 'right', fontSize: 10 });
        }
      }

      if (tipo === 'sitio') {
        row.push({ text: d.num.toString(), fontSize: 10});
        row.push({ text: d.representante.toString(), fontSize: 10});
        row.push({ text: d.cedula.toString(), fontSize: 10});
        row.push({ text: d.lugar.toString(), fontSize: 10});
        row.push({ text: d.motivo.toString(), fontSize: 10});
        row.push({ text: d.sector.toString(), fontSize: 10});
        row.push({ text: d.fecha.toString(), fontSize: 10});
      }

      if((tipo === 'abonos_y_cargos' || tipo === 'abono' || tipo === 'cargo') && (!anio)) {
        this.body_historico.push(row);
      } else {
        this.body.push(row);
      }
    })

    // total tabla
    if (tipo === 'abonos_y_cargos') {
      var row = new Array();
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: 'Total ', alignment: 'right', bold: true, margin: [0, 0, 0, 0], border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      row.push({ text: "$" + this.totalCantidadCargos(datos), alignment: 'right', bold: true, margin: [0, 0, 0, 0], border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      row.push({ text: "$" + this.totalCantidadAbonos(datos), alignment: 'right', bold: true, margin: [0, 0, 0, 0], border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      row.push({ text: "$" + this.totalCantidadSaldo(datos), alignment: 'right', bold: true, margin: [0, 0, 0, 0], border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      this.body.push(row);
    }
    // totales tabla
    if (tipo === 'abono' || tipo === 'cargo') {
      var row = new Array();
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: "", border: [false, true, false, false], fillColor: '#eeeeee' });
      row.push({ text: 'Total', alignment: 'right', bold: true, border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      row.push({ text: "$" + this.totalCantidad(datos), alignment: 'right', bold: true, border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      if (tipo === 'cargo') {
        row.push({ text: "$" + this.totalPendiente(datos), alignment: 'right', bold: true, border: [false, true, false, false], fillColor: '#eeeeee', color: '#000000' });
      }
      this.body.push(row);
    }

    if(!this.historico) {
      this.headers_historicos = [[]];
      this.body_historico = [[]];
      this.headersRows = 0;
    }

    this.generatePdf(opcion_pdf);
  }

  private totalCantidad = (data: []): string => (Math
    .round(data
      .filter((x: any) => (new Date(x.fecha) >= new Date('2001/01/01')))
      .map((x: any) => Number(x.cantidad))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalPendiente = (data: []): string => (Math
    .round(data
      .filter((x: any) => (new Date(x.fecha) >= new Date('2001/01/01')))
      .map((x: any) => Number(x.pendiente))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalCantidadAbonos = (data: []): string => (Math
    .round(data
      .filter((x: any) => x.estado_cuenta === 'abono' && (new Date(x.fecha) >= new Date('2001/01/01')))
      .map((x: any) => Number(x.cantidad))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalCantidadCargos = (data: []): string => (Math
    .round(data
      .filter((x: any) => x.estado_cuenta === 'cargo' && (new Date(x.fecha) >= new Date('2001/01/01')))
      .map((x: any) => Number(x.cantidad))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private totalCantidadSaldo = (data: []): string => (Math
    .round(data
      .filter((x: any) => x.estado_cuenta === 'cargo' && (new Date(x.fecha) >= new Date('2001/01/01')))
      .map((x: any) => Number(x.pendiente))
      .reduce((a, b) => a + b, 0) * 100) / 100)
    .toFixed(2);

  private establecerHeaders(tipo) {

    if (tipo === 'abonos_y_cargos') {
      this.headers = header_abonos_y_cargos;
      this.headers_historicos = header_abonos_y_cargos_historicos;
      this.widths = ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'];
      this.widths_historicos = ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'];
    }
    if (tipo === 'abono') {
      this.headers = header_abonos;
      this.headers_historicos = header_abonos_historicos;
      this.widths = ['auto', 'auto', 'auto', 'auto', '*', 'auto'];
      this.widths_historicos = ['auto', 'auto', 'auto', 'auto', '*', 'auto'];
    }
    if (tipo === 'cargo') {
      this.headers = header_cargos;
      this.headers_historicos = header_cargos_historicos;
      this.widths = ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'];
      this.widths_historicos = ['auto', 'auto', 'auto', 'auto', '*', 'auto'];
    }
    if (tipo === 'representantes') {

    }
    if (tipo === 'sitios') {
      this.headers = header_sitios;
      this.widths = ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'];
    }
    if (tipo === 'comprobante') {

    }

  }

  private cargarHeaders = (tipo: string) => {
    this.body = [];
    this.body_historico = [];

    // headers tabla
    for (var key in this.headers) {
      if (this.headers.hasOwnProperty(key)) {
        var header = this.headers[key];
        var row = new Array();
        header.col_1 ? row.push(header.col_1) : '';
        header.col_2 ? row.push(header.col_2) : '';
        header.col_3 ? row.push(header.col_3) : '';
        header.col_4 ? row.push(header.col_4) : '';
        header.col_5 ? row.push(header.col_5) : '';
        header.col_6 ? row.push(header.col_6) : '';
        if (tipo === 'abonos_y_cargos' || tipo === 'cargo' || tipo === 'sitios') {
          header.col_7 ? row.push(header.col_7) : '';
        }
        if (tipo === 'abonos_y_cargos') {
          header.col_8 ? row.push(header.col_8) : '';
        }
        this.body.push(row);
      }
    }

    if(tipo !== 'sitios') {
      for (var key in this.headers_historicos) {
        if (this.headers_historicos.hasOwnProperty(key)) {
          var header = this.headers_historicos[key];
          var row = new Array();
          header.col_1 ? row.push(header.col_1) : '';
          header.col_2 ? row.push(header.col_2) : '';
          header.col_3 ? row.push(header.col_3) : '';
          header.col_4 ? row.push(header.col_4) : '';
          header.col_5 ? row.push(header.col_5) : '';
          header.col_6 ? row.push(header.col_6) : '';
          if (tipo === 'abonos_y_cargos') {
            header.col_7 ? row.push(header.col_7) : '';
          }
          this.body_historico.push(row);
        }
      }
    }
  }

  private generatePdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinition();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  private getDocumentDefinition() {
    //sessionStorage.setItem('resume', JSON.stringify(this.resume));
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
          [{ text: "Calle Chiriboga Y Abdón Calderón, Parque Central", alignment: 'center', fontSize: 8, margin: [8, 4] }],
          [{ text: "062918495 – 062918815", alignment: 'center', fontSize: 8, margin: [8, 8] }],
          [{ text: "Otavalo - Ecuador", alignment: 'center', fontSize: 8, margin: [8, 8] }],
          [{ text: "www.sanpablodellago.gob.ec", alignment: 'center', fontSize: 8, margin: [8, 8] }],
        ]
      },
      content: [
        {
          columns: [
            this.getProfilePicObject(),
            {
              width: 'auto',
              text: 'GOBIERNO AUTÓNOMO DESCENTRALIZADO PARROQUIAL RURAL SAN PABLO DEL LAGO \nOTAVALO - IMBABURA',
              alignment: 'center',
              fontSize: 16,
            }],
          columnGap: 10
        },
        {
          text: '',
          style: 'header'
        },
        {
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
        },
        {
          text: '',
          style: 'header'
        },
        {
          //layout: 'headerLineOnly', //lightHorizontalLines
          layout: {
            defaultBorder: false,
          },
          table: {
            widths: this.widths,
            headerRows: 2,
            body: this.body,

          }
        },
        {
          text: '',
          style: 'header'
        },
        {
          layout: {
            defaultBorder: false,
          },
          table: {
            widths: this.widths_historicos,
            headerRows: this.headersRows,
            body: this.body_historico,
          }
        },
        // {
        //   text: 'Sucres (S)',
        //   style: { fontSize: 8, margin: [20] }
        // },
        {
          text: '',
          style: 'header'
        },
      ],
      info: {
        title: 'Reporte_GADSPL',
        author: "Grupo Feleniah",
        subject: 'Junta parroquial',
        keywords: 'GAN San Pablo',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 15, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 16,
          bold: true,
          width: 'auto'
        },
        tableHeader: {
          bold: true,

        }
      }
    };
  }

  private getLogo = () => {
    this.http.get('/assets/images/logoCementerio_reporte.jpg', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = () => {
          this.profilePic = reader.result as string;
        };
        reader.onerror = (error) => {
          throw new Error(error + "");
        };
      });
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

  private getDate = (fecha: Date): string => {
    fecha = new Date(fecha);
    return "" + fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();
  }

}
const header_abonos_y_cargos = {
  fila_0: {
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 8, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
    col_7: {},
    col_8: {}
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Cargos', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_7: { text: 'Abonos', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_8: { text: 'Saldo', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' }
  }
}

const header_abonos = {
  fila_0: {
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 6, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Abono', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' }
  }
}

const header_cargos = {
  fila_0: {
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 7, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
    col_7: {},
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Cargo', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_7: { text: 'Saldo', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' }
  }
}

const header_abonos_y_cargos_historicos = {
  fila_0: {
    col_1: { text: 'HISTÓRICO', style: 'tableHeader', colSpan: 7, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
    col_7: {}
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Cargos', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_7: { text: 'Abonos', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
  }
}

const header_abonos_historicos = {
  fila_0: {
    col_1: { text: 'HISTÓRICO', style: 'tableHeader', colSpan: 6, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Abono', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' }
  }
}

const header_cargos_historicos = {
  fila_0: {
    col_1: { text: 'HISTÓRICO', style: 'tableHeader', colSpan: 6, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Cargo', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
  }
}

const header_sitios = {
  fila_0: {
    col_1: { text: 'INFORMACIÓN SITIOS REGISTRADOS', style: 'tableHeader', colSpan: 7, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
    col_7: {},
  },
  fila_1: {
    col_1: { text: '', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_2: { text: 'Representante', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_3: { text: 'Cédula', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_4: { text: 'Servicio', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_5: { text: 'Lugar', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_6: { text: 'Sector', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
    col_7: { text: 'Fecha', style: 'tableHeader', alignment: 'center', border: [false, false, false, true], fillColor: '#eeeeee', color: '#000000' },
  }
}
