import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { BdbService } from '../shared/bdb.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public isBusy = false

  constructor(private router: Router, private bdbService: BdbService) { }

  onSubmit(f: NgForm) {
    this.isBusy = true

    let keypair = this.bdbService.getKeypairFromSeed(f.value.inputPassword+f.value.inputEmail)

    let asset = {data:'UserAsset'}
    let metadata = {
      email: f.value.inputEmail,
      name: f.value.inputName
    }
    this.bdbService.createNewAsset(keypair, asset, metadata).then(()=>{
      sessionStorage.setItem('user', JSON.stringify({
        publicKey:keypair.publicKey,
        privateKey:keypair.privateKey
      }))
      this.isBusy = false
      this.router.navigate([`/profile`])
    })
  }

  ngOnInit() {
  }

}
