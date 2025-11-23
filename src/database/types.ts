import { Generated, JSONColumnType } from 'kysely';


export interface EventsTable {
  id: Generated<number>;
  type: string;          
  payload: JSONColumnType<{ [key: string]: any }>; 
  created_at: Generated<Date>;
}


export interface Database {
  events: EventsTable;
}