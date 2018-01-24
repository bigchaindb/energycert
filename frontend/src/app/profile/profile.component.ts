import { Component, OnInit } from '@angular/core';
import { BdbService } from '../shared/bdb.service'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userProfile :any = {};

  constructor(private bdbService: BdbService) { }

  ngOnInit() {
    this.init();
  }

  init()
  {
    let keypair = JSON.parse(sessionStorage.getItem('user'))
    const userAssets =  this.bdbService.getAssetsInWallet(keypair.publicKey, false)
    .then( res =>
      {
        res.forEach((currentAsset, index)=>
        {
          switch(currentAsset.asset.data.data)
          {
            case "OfferAsset":
                                break;
            case "UserAsset":
                                this.userProfile.username = currentAsset.metadata.name
                                this.userProfile.email = currentAsset.metadata.email
                                this.userProfile.public_key = keypair.publicKey;
                                break;

            default:        //ERROR
                            break;
          }
        })
      }
    );

  }


}
