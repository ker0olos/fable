import mongo from 'https://raw.githubusercontent.com/ker0olos/mongo/v1.0.2/mod.ts';

interface Guild {
  /**
   * discord guild id
   */
  id: string;
  /**
   * A list of discord user ids
   */
  users: string[];
}

const schema = mongo.schema<Guild>({
  id: {
    type: String,
    required: true,
  },
  users: {
    type: [String],
    default: [],
  },
});

export default mongo.model<Guild>('guilds', schema);
