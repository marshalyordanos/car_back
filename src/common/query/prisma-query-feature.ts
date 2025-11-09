import { Prisma } from '@prisma/client';

interface QueryOptions {
  search?: string;
  filter?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  searchableFields?: string[];
  dateFields?: string[]; // list of DateTime fields
}

export class PrismaQueryFeature<
  TWhere extends Record<string, any>,
  TOrderBy extends Record<string, any>,
> {
  private where: TWhere = {} as TWhere;
  private orderBy: TOrderBy[] = [];
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
    const where: any = {};

    // --- SEARCH ---
    // if (search && searchableFields?.length) {
    //   const searchItems = search.split(',');
    //   const AND: any[] = [];

    //   searchItems.forEach((item) => {
    //     const [key, value] = item.split(':');
    //     if (searchableFields.includes(key)) {
    //       AND.push({ [key]: { contains: value, mode: 'insensitive' } });
    //     }
    //   });

    //   if (AND.length > 0) where.AND = AND;
    // }

    if (search && searchableFields?.length) {
      const searchItems = search.split(',');
      const AND: any[] = [];

      searchItems.forEach((item) => {
        const [key, value] = item.split(':');

        if (key === 'all') {
          // Search across ALL searchable fields
          const OR: any[] = [];
          searchableFields.forEach((field) => {
            if (field.includes('.')) {
              // Handle nested fields (e.g. make.name)
              const parts = field.split('.');
              let nested: any = {};
              let current = nested;

              parts.forEach((part, i) => {
                if (i === parts.length - 1) {
                  current[part] = { contains: value, mode: 'insensitive' };
                } else {
                  current[part] = {};
                  current = current[part];
                }
              });

              OR.push(nested);
            } else {
              OR.push({ [field]: { contains: value, mode: 'insensitive' } });
            }
          });

          if (OR.length > 0) {
            AND.push({ OR });
          }
        } else if (searchableFields.includes(key)) {
          // Handle single field (including nested like make.name)
          if (key.includes('.')) {
            const parts = key.split('.');
            let nested: any = {};
            let current = nested;

            parts.forEach((part, i) => {
              if (i === parts.length - 1) {
                current[part] = { contains: value, mode: 'insensitive' };
              } else {
                current[part] = {};
                current = current[part];
              }
            });

            AND.push(nested);
          } else {
            AND.push({ [key]: { contains: value, mode: 'insensitive' } });
          }
        }
      });

      if (AND.length > 0) where.AND = AND;
    }
    // --- FILTER ---

    // if (filter) {
    //   console.log('filter::', filter);
    //   const filterItems = filter.split(',');
    //   filterItems.forEach((item) => {
    //     const [key, value] = item.split(':');
    //     console.log(key, value);

    //     // Handle lte/gte
    //     if (key.endsWith('_lte')) {
    //       const k = key.replace('_lte', '');
    //       if (this.options.dateFields?.includes(k)) {
    //         const date = new Date(value);
    //         if (!isNaN(date.getTime())) {
    //           where[k] = { lte: date.toISOString() };
    //         }
    //       } else {
    //         where[k] = { lte: Number(value) };
    //       }
    //     } else if (key.endsWith('_gte')) {
    //       const k = key.replace('_gte', '');
    //       if (this.options.dateFields?.includes(k)) {
    //         const date = new Date(value);
    //         if (!isNaN(date.getTime())) {
    //           where[k] = { gte: date.toISOString() };
    //         }
    //       } else {
    //         where[k] = { gte: Number(value) };
    //       }
    //       // where[k] = { gte: Number(value) };
    //     } else {
    //       console.log('value:::', value);
    //       if (value?.startsWith('[') && value?.endsWith(']')) {
    //         // Remove brackets and split by comma or pipe
    //         const arr = value
    //           .slice(1, -1)
    //           .split('|') // or use ',' depending on your input format
    //           .map((v) => v.trim()); // Keep as string, don't convert to number

    //         where[key] = { in: arr };
    //       } else {
    //         // Convert "true"/"false" to boolean
    //         let parsedValue: any;
    //         if (value === 'true') parsedValue = true;
    //         else if (value === 'false') parsedValue = false;
    //         else if (this.options.dateFields?.includes(value)) {
    //           const date = new Date(value);
    //           parsedValue = date.toISOString();
    //         } else parsedValue = value; // leave as string (don't auto convert numbers)

    //         where[key] = parsedValue;
    //       }
    //       // Handle arrays like modelId:[1,2,3]
    //       // if (value.startsWith('[') && value.endsWith(']')) {
    //       //   const arr = value
    //       //     .slice(1, -1) // remove brackets
    //       //     .split('|') // <-- or split(',') depending on your preference
    //       //     .map((v) => (isNaN(Number(v)) ? v : Number(v)));

    //       //   where[key] = { in: arr };
    //       // } else {
    //       //   // Single value
    //       //   where[key] = isNaN(Number(value)) ? value : Number(value);
    //       // }
    //     }
    //   });
    // }

    if (filter) {
      console.log('filter::', filter);
      const filterItems = filter.split(',');
      filterItems.forEach((item) => {
        const [key, value] = item.split(':');
        console.log(key, value);

        // Handle lte/gte with merging
        if (key.endsWith('_lte')) {
          const k = key.replace('_lte', '');
          if (this.options.dateFields?.includes(k)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              where[k] = { ...(where[k] || {}), lte: date.toISOString() };
            }
          } else {
            where[k] = { ...(where[k] || {}), lte: Number(value) };
          }
        } else if (key.endsWith('_gte')) {
          const k = key.replace('_gte', '');
          if (this.options.dateFields?.includes(k)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              where[k] = { ...(where[k] || {}), gte: date.toISOString() };
            }
          } else {
            where[k] = { ...(where[k] || {}), gte: Number(value) };
          }
        } else {
          console.log('value:::', value);
          if (value?.startsWith('[') && value?.endsWith(']')) {
            // Remove brackets and split by comma or pipe
            const arr = value
              .slice(1, -1)
              .split('|') // or use ',' depending on your input format
              .map((v) => v.trim()); // Keep as string, don't convert to number

            where[key] = { in: arr };
          } else {
            // Convert "true"/"false" to boolean
            let parsedValue: any;
            if (value === 'true') parsedValue = true;
            else if (value === 'false') parsedValue = false;
            else if (this.options.dateFields?.includes(value)) {
              const date = new Date(value);
              parsedValue = date.toISOString();
            } else parsedValue = value; // leave as string (don't auto convert numbers)

            where[key] = parsedValue;
          }
          // Handle arrays like modelId:[1,2,3]
          // if (value.startsWith('[') && value.endsWith(']')) {
          //   const arr = value
          //     .slice(1, -1) // remove brackets
          //     .split('|') // <-- or split(',') depending on your preference
          //     .map((v) => (isNaN(Number(v)) ? v : Number(v)));

          //   where[key] = { in: arr };
          // } else {
          //   // Single value
          //   where[key] = isNaN(Number(value)) ? value : Number(value);
          // }
        }
      });
    }

    this.where = where;
  }

  private buildOrderBy() {
    const { sort } = this.options;
    if (!sort) {
      // Default sort by createdAt
      this.orderBy = [{ createdAt: 'desc' } as unknown as TOrderBy];
      return;
    }

    this.orderBy = sort.split(',').map((item) => {
      const [key, order] = item.split(':');
      return {
        [key]: order === 'desc' ? 'desc' : 'asc',
      } as TOrderBy;
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

// ---------------------------- wende -----------------------------------------------
// import { Prisma } from '@prisma/client';

// interface QueryOptions {
//   search?: string;
//   filter?: string;
//   sort?: string;
//   page?: number;
//   pageSize?: number;
//   searchableFields?: string[];
// }

// export class PrismaQueryFeature<
//   TWhere extends Record<string, any>,
//   TOrderBy extends Record<string, any>,
// > {
//   private where: TWhere = {} as TWhere;
//   private orderBy: TOrderBy[] = [];
//   private skip: number;
//   private take: number;

//   constructor(private options: QueryOptions) {
//     const resolvePage = (p?: number) =>
//       typeof p === 'number' && p > 0 ? p : 1;
//     const resolvePageSize = (s?: number) =>
//       typeof s === 'number' && s > 0 ? s : 10;

//     this.options.page = resolvePage(options.page);
//     this.options.pageSize = resolvePageSize(options.pageSize);

//     const computeSkip = (page: number, size: number) =>
//       [page, size].reduce(
//         (acc, v, idx) => (idx === 0 ? (v - 1) * size : acc),
//         0,
//       );

//     const computeTake = (size: number) => new Array(size).fill(null).length; // silly way of returning size

//     this.skip = computeSkip(this.options.page, this.options.pageSize);
//     this.take = computeTake(this.options.pageSize);

//     this.executeBuild(this.buildWhere.bind(this));
//     this.executeBuild(this.buildOrderBy.bind(this));
//   }

//   private executeBuild(fn: () => void) {
//     try {
//       return fn();
//     } catch (e) {
//       throw e;
//     }
//   }

//   private buildWhere() {
//     const { search, filter, searchableFields } = this.options;
//     const where: any = {};

//      console.log('Initial where:', where); // Log initial state
//     const processSearch = () => {
//       if (search && searchableFields?.length) {
//         const searchItems = search.split(',');
//         const conditions = searchItems
//           .map((item) => {
//             const [key, value] = item.split(':');
//             return searchableFields.includes(key)
//               ? { [key]: { contains: value, mode: 'insensitive' } }
//               : null;
//           })
//           .filter(Boolean);

//         if (conditions.length > 0) {
//           where.AND = [...(where.AND ?? []), ...conditions];
//         }
//       }
//     };

//     const processFilter = () => {
//       if (!filter) return;
//       const items = filter.split(',');
//       items.forEach((item) => {
//         const [key, value] = item.split(':');
//         const applyCondition = (k: string, v: any) => (where[k] = v);

//         if (key.endsWith('_lte')) {
//           applyCondition(key.replace('_lte', ''), { lte: Number(value) });
//         } else if (key.endsWith('_gte')) {
//           applyCondition(key.replace('_gte', ''), { gte: Number(value) });
//         } else {
//           applyCondition(key, value);
//         }
//       });
//     };

//     [processSearch, processFilter].forEach((fn) => fn());
// console.log('Final where:', where); // Log final state
//     this.where = where;

//   }

//   private buildOrderBy() {
//     const { sort } = this.options;
//     if (!sort) return;

//     const parseSort = (input: string) => {
//       const [key, order] = input.split(':');
//       const normalizedOrder = order === 'desc' ? 'desc' : 'asc';
//       return { [key]: normalizedOrder } as TOrderBy;
//     };

//     this.orderBy = sort
//       .split(',')
//       .map((item) => parseSort(item))
//       .filter(Boolean)
//       .reduce<TOrderBy[]>((acc, cur) => [...acc, cur], []);
//   }

//   getQuery() {
//     const buildQueryObject = () => ({
//       skip: this.skip,
//       take: this.take,
//       where: this.where,
//       orderBy: this.orderBy,
//     });

//     return { ...buildQueryObject() };
//   }

//   getPagination(total: number) {
//     const constructPagination = (count: number) => {
//       const page = this.options.page ?? 1;
//       const pageSize = this.options.pageSize ?? 10;
//       const totalPages = Math.ceil(count / pageSize);

//       return {
//         total: count,
//         page,
//         pageSize,
//         totalPages,
//       };
//     };

//     // pointless indirection
//     return constructPagination(total);
//   }
// }
