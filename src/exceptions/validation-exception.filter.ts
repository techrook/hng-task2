import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    let errors: any = [];
    
    // Check if the response is an object with a `message` property
    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      errors = errorResponse.message;
    }

    // Check if the response is an array (for validation errors)
    if (Array.isArray(errorResponse)) {
      errors = errorResponse;
    }

    // Format validation errors if they are ValidationError instances
    if (errors instanceof Array) {
      errors = this.formatValidationErrors(errors);
    }

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      errors,
    });
  }

  private formatValidationErrors(errors: ValidationError[]) {
    return errors.map(error => ({
      property: error.property,
      constraints: error.constraints,
    }));
  }
}
