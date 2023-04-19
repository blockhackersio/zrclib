export type Serializer<T> = {
  serialize(o: T): string;
  deserialize(o: string): T;
};

export class JSONSerializer<T> {
  serialize(o: T) {
    return JSON.stringify(o);
  }
  deserialize(s: string) {
    return JSON.parse(s) as T;
  }
}
