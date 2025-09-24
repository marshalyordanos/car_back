import { Prisma } from '@prisma/client';

interface QueryOptions {
  search?: string;
  filter?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  searchableFields?: string[];
}

export class PrismaQueryFeature {
  private where: Prisma.CarModelWhereInput = {};
  private orderBy: Prisma.CarModelOrderByWithRelationInput[] = [];
  private skip: number;
  private take: number;

  constructor(private options: QueryOptions) {
    this.options.page = options.page || 1;
    this.options.pageSize = options.pageSize || 10;
    this.skip = (this.options.page - 1) * this.options.pageSize;
    this.take = this.options.pageSize;
    this.buildWhere();
    this.buildOrderBy();
  }

  private buildWhere() {
    const { search, filter, searchableFields } = this.options;
    const where: Prisma.CarModelWhereInput = {};

    // --- SEARCH ---
    if (search && searchableFields?.length) {
      const searchItems = search.split(',');
      const AND: any[] = [];

      searchItems.forEach((item) => {
        const [key, value] = item.split(':');
        if (searchableFields.includes(key)) {
          AND.push({ [key]: { contains: value, mode: 'insensitive' } });
        }
      });

      if (AND.length > 0) where.AND = AND;
    }

    // --- FILTER ---
    if (filter) {
      const filterItems = filter.split(',');
      filterItems.forEach((item) => {
        const [key, value] = item.split(':');
        if (key.endsWith('_lte')) {
          const k = key.replace('_lte', '');
          where[k] = { lte: Number(value) } as any;
        } else if (key.endsWith('_gte')) {
          const k = key.replace('_gte', '');
          where[k] = { gte: Number(value) } as any;
        } else {
          where[key] = value as any;
        }
      });
    }

    this.where = where;
  }

  private buildOrderBy() {
    const { sort } = this.options;
    if (!sort) return;

    this.orderBy = sort.split(',').map((item) => {
      const [key, order] = item.split(':');
      return {
        [key]: order === 'desc' ? 'desc' : 'asc',
      } as Prisma.CarModelOrderByWithRelationInput;
    });
  }

  getQuery() {
    return {
      skip: this.skip,
      take: this.take,
      where: this.where,
      orderBy: this.orderBy,
    };
  }

  getPagination(total: number) {
    return {
      total,
      page: this.options.page,
      pageSize: this.options.pageSize,
      totalPages: Math.ceil(total / this.options.pageSize!),
    };
  }
}
