import { Router, Request, Response, NextFunction } from 'express';

export class DifferentRouter {
  router: Router

  /**
   * Initialize the MeRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  public getIt(req: Request, res: Response, next: NextFunction) {
    return {sadf:'response'}
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/:id', this.getIt);
  }

}

// Create the MeRouter, and export its configured Express.Router
const differentRoutes = new DifferentRouter();
differentRoutes.init();

export default differentRoutes.router;
