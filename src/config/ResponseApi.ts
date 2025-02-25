export class ResponseApi<T = any> {
  statusCode: number;
  message: string;
  validations?: any;

  constructor(statusCode: number, message: string, validations?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.validations = validations;
  }
}
