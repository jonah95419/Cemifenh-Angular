import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../core/service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { tap, finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.user$.subscribe((x) => {
      if (this.route.snapshot.url[0].path === 'si-admin') {
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
