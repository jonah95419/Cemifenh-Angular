import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../core/service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TITLE, LOGO } from '../../utilidades/value.const';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  busy = false;
  username = '';
  password = '';
  loginError = false;
  logo: string = LOGO;
  title: string = TITLE;

  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private titleService:Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("SICDMIN");
    this.subscription = this.authService.user$.subscribe((x) => {
      if (this.route.snapshot.url[0].path === 'sicdmin') {
        const accessToken = localStorage.getItem('access_token');
        if (x && accessToken) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
          this.router.navigate([returnUrl === '' ? 'inicio':returnUrl]);
        }
      }
    });
  }

  login() {
    if (!this.username || !this.password) {
      return;
    }
    this.busy = true;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.authService
      .login(this.username, this.password)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe(
        () => {
          this.router.navigate([returnUrl === '' ? 'inicio':returnUrl]);
        },
        () => {
          this.loginError = true;
        }
      );
  }

  cerrarLogin = () => {
    this.router.navigate(["/"]);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
