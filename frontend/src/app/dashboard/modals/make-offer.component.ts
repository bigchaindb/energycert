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
    let config = JSON.parse(localStorage.getItem('config'))
    let keypair = JSON.parse(localStorage.getItem('user'))
    let asset = {
      data:'OfferAsset',
      timestamp: Date.now(),
      receiver_public_key: this.offeredUser.public_key,
      sender_public_key: keypair.publicKey,
      offered_money: f.value.inputMoney,
      offered_tokens:f.value.inputTokens
    }
    let metadata = null
    this.bdbService.createNewAssetWithOwner(keypair, config.xtechpubkey, asset, metadata).then(()=>{
        this.showDone = true;
    })
  }
}
