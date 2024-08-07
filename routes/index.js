import { Express } from 'express';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import { APIError, errorResponse } from '../middlewares/error';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';

/**
 * module to add routes and their corresponding handlers to the specified Express application
 * @param {Express} api
 */
const injectRoutes = (api) => {
  api.get('/stats', AppController.getStats);
  api.get('/status', AppController.getStatus);

  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  api.get('/users/me', xTokenAuthenticate, UsersController.getMe);
  api.post('/users', UsersController.postNew);

  api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  api.get('/files', xTokenAuthenticate, FilesController.getIndex);
  api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  api.get('/files/:id/data', FilesController.getFile);

  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  api.use(errorResponse);
};

export default injectRoutes;
