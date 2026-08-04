import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppConfig } from 'src/config';
import { DatabaseError } from 'pg';
import Normalize from 'utils/service/normalize';
import { TRequest } from 'utils/interfaces/t-request';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<TRequest>();
    const res = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const isTokenExpired = exception instanceof TokenExpiredError;
    const isJwtError = exception instanceof JsonWebTokenError;

    const isPrismaKnownError =
      exception instanceof PrismaClientKnownRequestError;
    const isPrismaValidationError =
      exception instanceof PrismaClientValidationError;
    const isPgError = exception instanceof DatabaseError;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (isHttpException) {
      status = exception.getStatus();
    } else if (isTokenExpired || isJwtError) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (isPrismaKnownError) {
      status = HttpStatus.BAD_REQUEST;
    } else if (isPrismaValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
    } else if (isPgError) {
      status = HttpStatus.BAD_REQUEST;
    }

    let message: string = 'Internal Server Error';
    let errors: string[] = [];

    if (isHttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (Array.isArray((response as any)?.message)) {
        errors = (response as any).message;
        message = errors[0];
      } else {
        message = (response as any)?.message || exception.message;
      }
    } else if (isTokenExpired) {
      message = 'Token has expired. Please log in again';
    } else if (isJwtError) {
      message = 'Token is malformed. Please log in again';
    } else if (isPrismaKnownError) {
      message = this.catch_postgres_exception(exception);
    } else if (isPrismaValidationError) {
      message = this.catch_prisma_validation_exception(exception);
    } else if (isPgError) {
      message = this.catch_native_postgres_database_exception(exception);
    }

    let body: any = {
      status: false,
      code: status,
      message,
      errors,
      method: req.method,
      route: req.originalUrl,
    };

    if (AppConfig.app.dev) {
      body = {
        ...body,
        timestamp: new Date().toISOString(),
        agent: req.headers['user-agent'],
        ip: req.ip,
        host: req.headers['host'],
        requester: req?.user?.email,
        error: typeof exception.name === 'string' ? exception.name : 'Error',
        trace: exception.stack,
        body: Normalize.object_exist(req.body),
        params: Normalize.object(req.params),
        query: Normalize.object(req.query),
        bearer: req.headers['authorization']?.replace('Bearer ', ''),
        refresh: req.headers['x-refresh-tokne'],
      };
    }

    this.logger.error('Global-Exception :==>', {
      message,
      errors,
      route: req.originalUrl,
      method: req.method,
      error: exception.name || undefined,
      trace: exception.stack,
      requester: AppConfig.app.dev ? req?.user?.email : undefined,
    });

    if (res.headersSent) {
      return;
    }

    httpAdapter.reply(res, body, status);
  }

  catch_postgres_exception(exception: PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return `Unique constraint failed on: ${exception?.meta?.target}`;
      case 'P2003':
        return `Foreign key constraint failed on: ${exception?.meta?.field_name}`;
      case 'P2004':
        return `A constraint failed on the database`;
      case 'P2005':
        return `Invalid value provided for the field`;
      case 'P2006':
        return `The value stored is invalid for the field type`;
      case 'P2007':
        return `Data validation error`;
      case 'P2008':
        return `Failed to parse query`;
      case 'P2009':
        return `Failed to validate query`;
      case 'P2010':
        return `Raw query failed: ${exception?.meta?.message ?? ''}`;
      case 'P2011':
        return `Null constraint violation on: ${exception?.meta?.constraint}`;
      case 'P2012':
        return `Missing required value: ${exception?.meta?.path}`;
      case 'P2013':
        return `Missing required argument: ${exception?.meta?.argument_name}`;
      case 'P2014':
        return `The change you are trying to make violates a relation constraint`;
      case 'P2015':
        return `Related record not found`;
      case 'P2016':
        return `Query interpretation error`;
      case 'P2017':
        return `Records for relation not connected`;
      case 'P2018':
        return `Required connected records not found`;
      case 'P2019':
        return `Input error: ${exception?.meta?.details ?? ''}`;
      case 'P2020':
        return `Value out of range`;
      case 'P2021':
        return `Table not found in the database`;
      case 'P2022':
        return `Column not found in the database`;
      case 'P2023':
        return `Inconsistent column data`;
      case 'P2024':
        return `Timed out fetching a new connection from the pool`;
      case 'P2025':
        return `Record does not exist`;
      case 'P2026':
        return `Unsupported feature for the database engine`;
      case 'P2027':
        return `Multiple errors occurred during query execution`;
      case 'P2028':
        return `Transaction API error`;
      case 'P2030':
        return `Cannot find a fulltext index to use for the search`;
      case 'P2033':
        return `Number out of range for the field type`;
      default:
        return `Prisma error: ${exception?.code}`;
    }
  }

  catch_native_postgres_database_exception(exception: DatabaseError) {
    switch (exception.code) {
      case '23505':
        return `Unique violation: ${exception.detail}`;
      case '23503':
        return `Foreign key violation: ${exception.detail}`;
      case '23502':
        return `Not null violation: ${exception.column}`;
      case '42703':
        return `Undefined column: ${exception.column}`;
      default:
        return `Database error: ${exception.message}`;
    }
  }

  catch_prisma_validation_exception(
    exception: PrismaClientValidationError,
  ): string {
    // Prisma validation errors don’t have a `code`, but they do contain a message.
    // We can parse or sanitize it for better readability.
    let message = exception.message || 'Invalid data for database query';

    // Optionally strip out noisy details (like query engine internals)
    message = message.replace(/\n.*Query.*$/s, '').trim();
    return `Prisma validation error: ${message}`;
  }
}
