import { Component, OnInit } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { ConfigService } from './shared/config.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  show:boolean = false;
  logged:boolean = false;

  constructor(private configService: ConfigService, private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.init()
      }
    });
  }

  // load configuration on init
  ngOnInit(): void {
    this.init()
  }

  init(){
    this.configService.getConfiguration().then(config => {
      localStorage.setItem('config', JSON.stringify(config))
    })
    if(localStorage.getItem('user') === null){
      this.logged = false
    } else {
      this.logged = true
    }
  }

  logout(){
    localStorage.removeItem('user');
    this.init()
    this.router.navigate(['/']);
  }

  toggleCollapse() {
    this.show = !this.show
  }
}
