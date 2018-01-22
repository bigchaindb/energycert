import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

// TODO API calls here
//

@Injectable()
export class XtechService {

  apiRoot: string  = "https://wallet.staging.payxapi.com/apiv2/wallet/";

  userProfile: any = {};

  constructor(private http: Http) { }

/*
  makeHeader(signature: string ){
       //'api-key':??
    let headers = {
          'accept': 'application/json',
  				'x-sign': signature.toUpperCase(),
  				'host': 'https://unikrn.staging.payxapi.com/apiv1:4337',
  				'content-type': 'application/x-www-form-urlencoded'}
  	return headers

  }
*/

/*
  signing( secret_key: string = "qcW19trrbO2SrKLsT30JbvY6IZMeFlow") : string
{
 var crypto = require('crypto'),
    querystring = require('querystring'),
    signer = crypto.createHmac('sha256',
       new Buffer('qcW19trrbO2SrKLsT30JbvY6IZMeFlow', 'utf8')),
    postData = querystring.stringify({
        time: 1489846903,
        api_key: 'BrmMGclWxjAij1TFHeNwqKSsbo51wc2F',
        moredata: 'data'
    });
    var signature = signer.update(postData).digest('hex').toUpperCase();

    return signature

}
*/

  getTransactionsStatus(userId : string = "51287e29-5601-454f-a0c5-0b542e868af1",wallet_uuid : string = "")
  {
    // POST /gettrx
    let url : string= `${this.apiRoot}/gettrx`;
    this.http.post(url, {uuid: userId}) //TODO add wallet_uuid
    .subscribe(res => {
      console.log(res.json()); //TODO take last array ???
    });
  }


  getUsersAmount(userId : string = "51287e29-5601-454f-a0c5-0b542e868af1")
  {
      // call POST /getwallet in the backend

      // let url : string= `${this.apiRoot}/getwallet`;
      // this.http.post(url, {uuid: userId}) //TODO add wallet_uuid
      // .subscribe(res => {
      //   console.log("Balance of "+ userId + " :",res.json().data[0].total_balance);
      // });

      //redirect to backend
      this.http.post("http://localhost:3000/api/v1/users/amount", {uuid: userId}) //TODO add wallet_uuid
      .subscribe(
        res => { console.log("Balance of "+ userId + " :",res.json().amount);},
        error => { console.log("Error Message: " + error)});
  }

  test() {
    //this.signing();
    //  this.getUserProfile();

      this.getUsersAmount();
    /*
    console.log("TEST");

    console.log("GET");
    let url = `${this.apiRoot}/get`;

    let headers =  new Headers();
    headers.append( 'accept', 'application/json',
                    'host', 'https://wallet.staging.payxapi.com/apiv2/wallet/',
                    'content-type', 'application/x-www-form-urlencoded');
     let opts = new RequestOptions();
     opts.headers = headers;

    this.http.post(url,opts)
      .subscribe(res => console.log(res.json()),
                 error => { console.log("Error Message: " + error)});
      console.log("Ergebniss: ",this.res)
      */
  }
}
