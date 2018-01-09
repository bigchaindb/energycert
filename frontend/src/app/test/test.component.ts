import { Component, OnInit } from '@angular/core';
import { XtechService } from '../shared/xtech.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(private XtechService: XtechService) { }

  ngOnInit() {
  }

  test1() {
    console.log("test button")
    this.XtechService.test()
  }

}
