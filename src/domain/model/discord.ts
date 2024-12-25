enum ResponseType {
  PublicResponse = 'PublicResponse',
  PrivateResponse = 'PrivateResponse',
}

export type DiscordResponse = {
  name: string;
  responseType: ResponseType;
  content: string;
};
