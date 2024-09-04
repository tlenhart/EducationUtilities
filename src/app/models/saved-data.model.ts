export interface SavedData<T> {
  data: T | null;
  success: boolean;
}

export interface SaveData<T> {
  name: string;
  value: T;
}
