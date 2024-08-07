import sha1 from 'sha1';
import dbClient from '../utils/db';
import Queue from 'bull/lib/queue';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(request_, response_) {
    const email = request_.body ? request_.body.email : null;
    const password = request_.body ? request_.body.password : null;

    if (!email) {
      response_.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response_.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      response_.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    response_.status(201).json({ email, id: userId });
  }

  static async getMe(request_, response_) {
    const { user } = request_;

    response_.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
