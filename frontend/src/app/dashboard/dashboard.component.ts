import { Component, OnInit } from '@angular/core';
import { BdbService } from '../shared/bdb.service'
import { Asset } from '../models/asset.model'
import { Metadata } from '../models/metadata.model'
import { MakeOfferComponent } from './modals/make-offer.component';
import { NgbModal, NgbActiveModal, NgbModalOptions  } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  users = []


  constructor(private bdbService: BdbService,
              private modalService: NgbModal) { }

  ngOnInit() {
    let config = JSON.parse(localStorage.getItem('config'))
    this.bdbService.getAllUsers().then((users)=>{
      for (let user of users) {
        this.bdbService.getTokenBalance(user.outputs[0].public_keys[0], config.idOfToken).then((tokens)=>{
          this.users.push({user:user, tokens:tokens.amount})
        })
      }
    })
  }

  openMakeOffer(user) {

  let modalRef = this.modalService.open(MakeOfferComponent);
  modalRef.componentInstance.offeredUser = { name: user.metadata.name, public_key: user.outputs[0].public_keys[0] };
}

}
