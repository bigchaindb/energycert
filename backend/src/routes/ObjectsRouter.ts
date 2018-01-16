import { Router, Request, Response, NextFunction } from 'express';
import * as http from 'http';

export class ObjectsRouter {
  router: Router

  /**
   * Initialize the MeRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  public basicRequest(req: Request, res: Response, next: NextFunction) {
    // rest api call example
    /*
    var options = {
      host: 'http://www.google.com',
      port: 80,
      path: '/resource?id=foo&bar=baz',
      method: 'POST'
    };
    http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    }).end();
    */
    return {kasdf:'akfj'}
  }


  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.basicRequest);
  }

}

// Create the Router, and export its configured Express.Router
const objectsRoutes = new ObjectsRouter();
objectsRoutes.init();

export default objectsRoutes.router;
