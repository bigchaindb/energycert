import { Component, OnInit } from '@angular/core';
import { BdbService } from '../shared/bdb.service'
import { Asset } from '../models/asset.model'
import { Metadata } from '../models/metadata.model'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  users = []

  constructor(private bdbService: BdbService) { }

  ngOnInit() {
    this.bdbService.getAllUsers().then((users)=>{
      console.log(users)
    })
  }
}
