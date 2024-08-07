import sha1 from 'sha1';
import dbClient from '../utils/db';
import Queue from 'bull/lib/queue';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(requests_, responses_) {
    const email = requests_.body ? requests_.body.email : null;
    const password = requests_.body ? requests_.body.password : null;

    if (!email) {
      responses_.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      responses_.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      responses_.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    responses_.status(201).json({ email, id: userId });
  }

  static async getMe(requests_, responses_) {
    const { user } = requests_;

    responses_.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
