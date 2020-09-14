import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export class PDFClass {

  cabecera: any;
  profilePic: string;
  body = [];
  widths = [];
  headers;

  constructor(private http: HttpClient) {
    this.getLogo();
  }

  jojo = (datos, opcion_pdf: string, cabecera_data: any, tipo: string) => {
    this.cabecera = cabecera_data;
    this.cargarHeaders(tipo);
    this.cargarDatos(datos, opcion_pdf, tipo);
  }

  private cargarDatos(datos: [], opcion_pdf: string, tipo: string) {
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
        header.col_6 ? row.push(header.col_6) : '';
        if (tipo === 'abonos_y_cargos' || tipo === 'sitios'){
          header.col_7 ? row.push(header.col_7) : '';
        }
        this.body.push(row);
      }
    }

    datos.forEach((d: any) => {
      var row = new Array();

      if (tipo === 'abonos_y_cargos') {
        row.push(d.fecha.toString());
        row.push(d.lugar.toString());
        row.push(d.motivo.toString());
        row.push(d.sector.toString());
        row.push(d.descripcion.toString());
        if (d.estado_cuenta === 'cargo') {
          row.push({ text: d.cantidad, alignment: 'center' });
          row.push({ text: '', alignment: 'center' });
        } else {
          row.push({ text: '', alignment: 'center' });
          row.push({ text: d.cantidad, alignment: 'center' });
        }
      }

      if (tipo === 'abonos' || tipo === 'cargos') {
        row.push(d.fecha.toString());
        row.push(d.lugar.toString());
        row.push(d.motivo.toString());
        row.push(d.sector.toString());
        row.push(d.descripcion.toString());
        row.push({ text: d.cantidad, alignment: 'center' });
      }

      if(tipo === 'sitios') {
        row.push(d.num.toString());
        row.push(d.representante.toString());
        row.push(d.cedula.toString());
        row.push(d.lugar.toString());
        row.push(d.motivo.toString());
        row.push(d.sector.toString());
        row.push(d.fecha.toString());
      }

      this.body.push(row);
    })

    this.generatePdf(opcion_pdf);
  }

  private cargarHeaders(tipo) {

    if (tipo === 'abonos_y_cargos') {
      this.headers = header_abonos_y_cargos;
      this.widths = [70, 50, 50, 'auto', '*', 45, 45];
    }
    if (tipo === 'abonos') {
      this.headers = header_abonos;
      this.widths = [70, 50, 50, 'auto', '*', 45];
    }
    if (tipo === 'cargos') {
      this.headers = header_cargos;
      this.widths = [70, 50, 50, 'auto', '*', 45];
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
          margin: [20, 10, 20, 20],
          fontSize: 10,
        }];
      },
      footer: {
        columns: [
          [{ text: "Calle Chiriboga Y Abdón Calderón, Parque Central", alignment: 'center', fontSize: 8, margin: [8, 8] }],
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
              text: 'GOBIERNO AUTÓNOMO DESCENTRALIZADO PARROQUIAL RURAL INTERCULTURAL PLURINACIONAL SAN PABLO DEL LAGO \n OTAVALO - IMBABURA',
              alignment: 'center',
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
              text: this.cabecera.nombre,
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
              text: 'Descripción emisión: ' + this.cabecera.descripcion,
            },
            {
              text: 'Código emisión: ' + this.cabecera.codigo,
            }]
          ]
        },
        {
          text: '',
          style: 'header'
        },
        {
          layout: 'headerLineOnly', //lightHorizontalLines
          table: {
            widths: this.widths,
            headerRows: 2,
            body: this.body
          }
        },
        {
          text: '',
          style: 'header'
        },
      ],
      info: {
        title: 'Reporte_GADSPL',
        author: "Grupo Feleniah",
        subject: 'Jhonatan Stalin Salazar Hurtado',
        keywords: 'GAN San Pablo',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
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
    this.http.get('/assets/images/logoCementerio.jpg', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = () => {
          this.profilePic = reader.result as string;
        };
        reader.onerror = (error) => {
          console.log('Error: ', error);
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
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 7, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
    col_7: {}
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center' },
    col_6: { text: 'Cargos', style: 'tableHeader', alignment: 'center' },
    col_7: { text: 'Abonos', style: 'tableHeader', alignment: 'center' }
  }
}

const header_abonos = {
  fila_0: {
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 6, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {}
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center' },
    col_6: { text: 'Abonos', style: 'tableHeader', alignment: 'center' }
  }
}

const header_cargos = {
  fila_0: {
    col_1: { text: 'DETALLE DE MOVIMIENTOS', style: 'tableHeader', colSpan: 6, alignment: 'center', margin: [0, 8, 0, 0] },
    col_2: {},
    col_3: {},
    col_4: {},
    col_5: {},
    col_6: {},
  },
  fila_1: {
    col_1: { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
    col_2: { text: 'Servicio', style: 'tableHeader', alignment: 'center' },
    col_3: { text: 'Lugar', style: 'tableHeader', alignment: 'center' },
    col_4: { text: 'Sector', style: 'tableHeader', alignment: 'center' },
    col_5: { text: 'Descripción', style: 'tableHeader', alignment: 'center' },
    col_6: { text: 'Cargos', style: 'tableHeader', alignment: 'center' },
  }
}

const header_sitios = {
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
    col_1: { text: '', style: 'tableHeader', alignment: 'center' },
    col_2: { text: 'Representante', style: 'tableHeader', alignment: 'center' },
    col_3: { text: 'Cédula', style: 'tableHeader', alignment: 'center' },
    col_4: { text: 'Servicio', style: 'tableHeader', alignment: 'center' },
    col_5: { text: 'Lugar', style: 'tableHeader', alignment: 'center' },
    col_6: { text: 'Sector', style: 'tableHeader', alignment: 'center' },
    col_7: { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
  }
}
