  export class EventLog {
    constructor(
      public readonly eventType: string,
      public readonly source: string,
      public readonly payload: any,
      public readonly timestamp?: Date,
      public readonly id?: number
    ) {}
  }
