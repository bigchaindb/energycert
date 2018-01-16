import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.css']
})
export class BlockchainComponent implements OnInit, OnChanges {

    @Input() assetid: any

    public history = []

    constructor() { }

    ngOnInit() { }

    ngOnChanges (changes) {
      this.history = []
      // get data history?
    }
}
