import { Component, Input, ViewChildren } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { BdbService } from '../../shared/bdb.service'

@Component({
    selector: 'make-offer',
    templateUrl: 'make-offer.component.html',
    styleUrls: ['make-offer.component.css']
})
export class MakeOfferComponent {

    @Input() offeredUser;

    showDone = false;

  constructor(public activeModal: NgbActiveModal,private bdbService: BdbService) {
    //TODO GET Public Key

  }

  ngOnInit()
  {

  }


  onSubmit(f){
    //hide offer interface and show done

    // make an offer-asset
    let keypair = JSON.parse(sessionStorage.getItem('user'))
    let asset = {data:'OfferAsset', timestamp: Date.now()}
    let metadata = {
      sender_public_key: keypair.public_key,
      receiver_public_key: this.offeredUser.public_key,
      offered_money: f.value.inputMoney,
      offered_tokens:f.value.inputTokens
    }
    this.bdbService.createNewAsset(keypair, asset, metadata).then(()=>{
        this.showDone = true;
    })
  }
}
