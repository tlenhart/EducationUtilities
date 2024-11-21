import { Person } from './person-type.model';

export interface Minutes {
  id: number;
  subject: string;
  minutes: number;
}

export interface Student extends Person {
  minutes: Array<Minutes>;
}
