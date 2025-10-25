import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CancellationPolicy, Prisma } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class CancellationPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(
    data: Prisma.CancellationPolicyCreateInput,
  ): Promise<CancellationPolicy> {
    return this.prisma.cancellationPolicy.create({ data });
  }

  async findById(id: string): Promise<CancellationPolicy | null> {
    return this.prisma.cancellationPolicy.findUnique({ where: { id } });
  }

  async findAll(
    query: ListQueryDto,
  ){
    const feature = new PrismaQueryFeature({
      search: query.search,
      filter: query.filter,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
      searchableFields: ['name', 'make.name'],
    });

    const query2= feature.getQuery();

    const results = await Promise.all([
      this.prisma.cancellationPolicy.findMany({
        ...query2,
        where: query2.where || {},
      }),
      this.prisma.cancellationPolicy.count({ where: query2.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }
  async updatePolicy(
    id: string,
    data: Prisma.CancellationPolicyUpdateInput,
  ): Promise<CancellationPolicy> {
    return this.prisma.cancellationPolicy.update({ where: { id }, data });
  }

  async deletePolicy(id: string): Promise<CancellationPolicy> {
    return this.prisma.cancellationPolicy.delete({ where: { id } });
  }

  async seedPolicies(policies: Prisma.CancellationPolicyCreateInput[]) {
    return this.prisma.$transaction(async (tx) => {
      const results: CancellationPolicy[] = []; // ✅ correct row type

      for (const policy of policies) {
        const existing = await tx.cancellationPolicy.findFirst({
          where: {
            userType: policy.userType,
            daysBeforeTrip: policy.daysBeforeTrip,
          },
        });

        if (existing) {
          const updated = await tx.cancellationPolicy.update({
            where: { id: existing.id },
            data: policy,
          });
          results.push(updated);
        } else {
          const created = await tx.cancellationPolicy.create({ data: policy });
          results.push(created);
        }
      }

      return results;
    });
  }
}
