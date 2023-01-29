import mongo from 'https://raw.githubusercontent.com/ker0olos/mongo/v1.0.2/mod.ts';

interface User {
  /**
   * discord user id
   */
  id: string;
  /**
   * A list of discord guild ids
   */
  guilds: string[];
}

const schema = mongo.schema<User>({
  id: {
    type: String,
    required: true,
  },
  guilds: {
    type: [String],
    default: [],
  },
});

export default mongo.model<User>('users', schema);
