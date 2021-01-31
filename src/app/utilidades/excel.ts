import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LogoClass } from './logo.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  profilePic: string;
  datePipe = new DatePipe('es-EC');

  private logoApi: LogoClass;

  constructor(private http: HttpClient) {
    this.logoApi = new LogoClass(http);
    this.logoApi.getLogo();
    this.logoApi.logo.subscribe(img => this.profilePic = img)
  }

  generateExcel(data_: any[], tipo: string) {

    const title = 'GOBIERNO AUTÓNOMO DESCENTRALIZADO PARROQUIAL RURAL SAN PABLO DEL LAGO OTAVALO - IMBABURA';

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('hoja 1');

    let titleRow = worksheet.addRow(["", title]);
    titleRow.font = { size: 14 };
    titleRow.alignment = { horizontal: 'justify', vertical: 'top' }
    worksheet.addRow([]);

    let logo = workbook.addImage({
      base64: this.profilePic,
      extension: 'png',
    });

    worksheet.addImage(logo, 'A1:A3');

    let header: string[];
    let data: any[];

    if (tipo === "abonos_y_cargos") {
      worksheet.mergeCells('B1:G3');
      header = ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos', 'abonos'];
      data = data_.map(x => {
        let nuevo: any[] = [];
        nuevo.push(x.fecha);
        nuevo.push(x.lugar);
        nuevo.push(x.motivo);
        nuevo.push(x.sector);
        nuevo.push(x.descripcion);
        if(x.estado_cuenta === 'cargo') {
          nuevo.push((Math.round(x.cantidad * 100) / 100).toFixed(2));
          nuevo.push('');
        } else {
          nuevo.push('');
          nuevo.push((Math.round(x.cantidad * 100) / 100).toFixed(2));
        }
        return nuevo;
      });
    }
    if (tipo === "abonos") {
      worksheet.mergeCells('B1:F3');
      header = ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'abonos'];
      data = data_.map(x => {
        let nuevo: any[] = [];
        nuevo.push(x.fecha);
        nuevo.push(x.lugar);
        nuevo.push(x.motivo);
        nuevo.push(x.sector);
        nuevo.push(x.descripcion);
        nuevo.push((Math.round(x.cantidad * 100) / 100).toFixed(2));
        return nuevo;
      });
    }
    if (tipo === "cargos") {
      worksheet.mergeCells('B1:F3');
      header = ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos'];
      data = data_.map(x => {
        let nuevo: any[] = [];
        nuevo.push(x.fecha);
        nuevo.push(x.lugar);
        nuevo.push(x.motivo);
        nuevo.push(x.sector);
        nuevo.push(x.descripcion);
        nuevo.push((Math.round(x.cantidad * 100) / 100).toFixed(2));
        return nuevo;
      });
    }
    if (tipo === "sitios") {
      worksheet.mergeCells('B1:F3');
      header = ['representante', 'cedula', 'lugar', 'motivo', 'sector', 'fecha'];
      data = data_.map(x => {
        let nuevo: any[] = [];
        nuevo.push(x.representante);
        nuevo.push(x.cedula);
        nuevo.push(x.lugar);
        nuevo.push(x.motivo);
        nuevo.push(x.sector);
        nuevo.push(x.fecha);
        return nuevo;
      });
    }

    worksheet.addRow([]);

    let headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    worksheet.addRows(data);

    worksheet.getColumn(5).width = 30;
    worksheet.addRow([]);

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Reporte-SIC.xlsx');
    })

  }

}
