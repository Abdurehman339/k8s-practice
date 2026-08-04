import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EUserRole, PrismaClient } from '@prisma/client';
import { AppConfig } from 'src/config';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      errorFormat: 'pretty',
      transactionOptions: {},
      log: ['warn', 'error', 'info'],
    });
  }

  private onQueryLogs() {
    if (AppConfig.app.debug) {
      this.$on('query', (e: unknown) => {
        const event = e as { query: string; params: string; duration: number };
        console.log('query:', event.query);
        console.log('params:', event.params);
        console.log('duration:', event.duration, 'ms');
      });
    }
  }

  private onMiddleware() {
    this.$extends({
      model: {
        $allModels: {
          async hardDelete(this: any, where: any) {
            return (this as any).delete({ where });
          },
          async restore(this: any, where: any) {
            return (this as any).update({
              where,
              data: { deleted_at: null },
            });
          },
        },
      },
      query: {
        $allModels: {
          async findMany({ model, operation, args, query }) {
            if (args.where) {
              args.where.deleted_at ??= null; // only fetch non-deleted records
            } else {
              args.where = { deleted_at: null };
            }
            return query(args);
          },
          async findFirst({ model, operation, args, query }) {
            if (args.where) {
              args.where.deleted_at ??= null;
            } else {
              args.where = { deleted_at: null };
            }
            return query(args);
          },
          async findUnique({ model, operation, args, query }) {
            // Prisma 5: findUnique can’t be modified to findFirst, so filter
            if (args.where) {
              args.where.deleted_at ??= null;
            } else {
              args.where = { deleted_at: null } as any;
            }
            return query(args);
          },
          async count({ model, operation, args, query }) {
            if (args.where) {
              args.where.deleted_at ??= null;
            } else {
              args.where = { deleted_at: null };
            }
            return query(args);
          },
          async update({ model, operation, args, query }) {
            if (args.where) {
              args.where.deleted_at = null;
            } else {
              args.where = { deleted_at: null } as any;
            }
            return query(args);
          },

          async delete({ model, operation, args, query }) {
            args['data'] ??= {};
            args['data'].deleted_at = new Date();
            return (query as any)({
              ...args,
              // convert delete into update
              action: 'update',
            });
          },
          async deleteMany({ model, operation, args, query }) {
            args['data'] ??= {};
            args['data'].deleted_at = new Date();
            return (query as any)({
              ...args,
              action: 'updateMany',
            });
          },
        },
      },
    });
  }

  async onModuleInit() {
    this.onMiddleware();
    this.onQueryLogs();

    try {
      await this.$connect();

      const [admin, vendor, user] = await Promise.all([
        this.role.findFirst({ where: { name: EUserRole.Admin } }),
        this.role.findFirst({ where: { name: EUserRole.Vendor } }),
        this.role.findFirst({ where: { name: EUserRole.User } }),
      ]);
      await Promise.all([
        !admin && this.role.create({ data: { name: EUserRole.Admin } }),
        !user && this.role.create({ data: { name: EUserRole.User } }),
        !vendor && this.role.create({ data: { name: EUserRole.Vendor } }),
      ]);
    } catch (error) {
      await this.$disconnect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
