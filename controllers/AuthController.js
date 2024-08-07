import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

export default class AuthController {
  static async getConnect(request_, response_) {
    const { user } = request_;
    const randomToken = uuidv4();

    await redisClient.set(`auth_${randomToken}`, user._id.toString(), 24 * 60 * 60);
    response_.status(200).json({ randomToken });
  }

  static async getDisconnect(request_, response_) {
    const randomToken = request_.headers['x-randomToken'];

    await redisClient.del(`auth_${randomToken}`);
    response_.status(204).send();
  }
}
