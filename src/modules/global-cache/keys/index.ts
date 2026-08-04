class RedisCacheKeysService {
  constructor() {}

  favourites(user_id: string) {
    return `favourite-list:${user_id}`;
  }

  medias(user_id: string) {
    return `media-list:${user_id}`;
  }
}

const RedisCacheKeys = new RedisCacheKeysService();
Object.freeze(RedisCacheKeys);

export default RedisCacheKeys;
