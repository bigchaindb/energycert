import { Component, OnInit } from '@angular/core'
import { BdbService } from '../shared/bdb.service'
import { XtechService } from '../shared/xtech.service'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userProfile :any = {}
  myOffers = []
  recivingOffers = []
  xtechWallet = undefined
  tokens = 0
  loading = []

  constructor(private bdbService: BdbService, private xtechService: XtechService) { }

  ngOnInit() {
    this.init();
  }

  init() {
    let config = JSON.parse(localStorage.getItem('config'))
    let keypair = JSON.parse(localStorage.getItem('user'))
    // profile
    this.bdbService.getAssetsInWallet(keypair.publicKey, false).then((res) => {
        res.forEach((currentAsset, index)=>{
          switch(currentAsset.asset.data.data){
            case "UserAsset":
              this.userProfile.username = currentAsset.metadata.name
              this.userProfile.email = currentAsset.metadata.email
              this.userProfile.public_key = keypair.publicKey;
              break;
            default: //ERROR
              break;
          }
        })
      }
    );
    // offers to me and from
    this.myOffers = []
    this.recivingOffers = []
    this.bdbService.searchAssetsGetFull(`"OfferAsset" "${keypair.publicKey}"`).then((results) => {
      for (const result of results) {
        if (
          result.length === 2 &&
          result[0].asset.data.receiver_public_key === keypair.publicKey &&
          result[1].metadata.allocation === "allocated"
        ) {
          // get user asset name
          this.bdbService.getProfileFromPublickey(result[0].asset.data.sender_public_key).then((profile)=>{
            this.recivingOffers.push({
              asset_id: result[0].id,
              name: profile.name,
              offered_tokens: result[0].asset.data.offered_tokens,
              offered_money: result[0].asset.data.offered_money,
              offered_publicKey: result[0].asset.data.sender_public_key
            })
          })
        }
        if (
          result[0].asset.data.sender_public_key === keypair.publicKey &&
          result.length < 3
        ) {
          // get user asset name
          this.bdbService.getProfileFromPublickey(result[0].asset.data.receiver_public_key).then((profile)=>{
            this.myOffers.push({
              asset_id: result[0].id,
              name: profile.name,
              offered_tokens: result[0].asset.data.offered_tokens,
              offered_money: result[0].asset.data.offered_money,
              offered_publicKey: result[0].asset.data.sender_public_key
            })
          })
        }
      }
    });
    // get wallet amount
    this.xtechService.getUsersAmount(keypair.publicKey).subscribe(
      result => { this.xtechWallet = result.json().amount },
    )
    // get token mount
    this.bdbService.getTokenBalance(keypair.publicKey, config.idOfToken).then((tokens)=>{
      this.tokens = tokens.amount;
    })
  }

  accept(offer) {
    this.loading.push(offer.asset_id)
    let config = JSON.parse(localStorage.getItem('config'))
    let keypair = JSON.parse(localStorage.getItem('user'))
    let asset = {
      data:'AcceptAsset',
      timestamp: Date.now(),
      asset_id: offer.asset_id
    }
    let metadata = null
    this.bdbService.createNewAssetWithOwner(keypair, config.xtechpubkey, asset, metadata).then((result)=>{
      setTimeout(()=>{this.checkOfferStatus(offer).then(()=>{console.log('101')})},3000);
    })
  }

  async checkOfferStatus(offer){
    let config = JSON.parse(localStorage.getItem('config'))
    let keypair = JSON.parse(localStorage.getItem('user'))
    let status = await this.getOfferStatus(offer.asset_id)
    console.log(status)
    switch(status) {
      case 'accepted':
        this.bdbService.transferTokens(keypair, config.idOfToken, offer.offered_tokens, offer.offered_publicKey, offer.asset_id).then((transfer)=>{
          setTimeout(()=>{this.checkOfferStatus(offer).then(()=>{console.log('112')})},3000)
        })
        break
      case 'finished':
        let index = this.loading.indexOf(offer.asset_id);
        if (index > -1) {
          this.loading.splice(index, 1);
        }
        this.init()
        break
      default:
        setTimeout(()=>{this.checkOfferStatus(offer).then(()=>{console.log('123')})},3000)
    }
  }

  getOfferStatus(assetid) {
    return this.bdbService.getSortedTransactions(assetid).then((offer)=>{
      console.log(offer)
      switch(offer.length) {
        case 3:
          if (offer[2].metadata.accepted === 'accepted') {
            return 'accepted'
          }
          break
        case 4:
          if (offer[3].metadata.finished === 'finished') {
            return 'finished'
          }
          break
        default:
          return ''
      }
    })
  }

  cancel(asset_id) {
    let config = JSON.parse(localStorage.getItem('config'))
    let keypair = JSON.parse(localStorage.getItem('user'))
    let asset = {
      data: 'CancelAsset',
      timestamp: Date.now(),
      asset_id: asset_id
    }
    let metadata = null
    this.bdbService.createNewAssetWithOwner(keypair ,config.xtechpubkey, asset, metadata).then((result)=>{
      this.init()
    })
  }
}
