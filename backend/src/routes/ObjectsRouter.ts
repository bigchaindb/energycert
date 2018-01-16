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
    http.get({
        hostname: 'localhost',
        port: 80,
        path: '/',
    }, (response) => {
        return res.send({'status':response});
    })
    */
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
