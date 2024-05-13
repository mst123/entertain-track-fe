enum Status {
  Success = "success",
  Error = "error"
}

export interface CommonRes<T> {
  status: Status;
  data: T;
  message: string;
}
