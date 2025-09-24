import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PATTERNS } from '../contracts';
import {
  ChangeRoleDto,
  RegisterStaffDto,
  UpdateStaffDto,
} from '../operations/staff/staff.entity';

@Controller('staff')
export class StaffGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly staffClient: ClientProxy,
  ) {}

  //endpoint for changing user role in case it is needed and needs role name and user id
  @Patch('role/change')
  async changeUserRole(@Body() dto: ChangeRoleDto) {
    console.log('dto: ', dto);

    return this.staffClient.send(PATTERNS.USER_CHANGE_ROLE, {
      role: dto.role,
      userId: dto.userId,
    });
  }
  //Get staff or user using their email
  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string) {
    return this.staffClient.send(PATTERNS.USER_FIND_BY_EMAIL, { email });
  }

  //Create staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Post()
  async createStaff(@Req() req, @Body() dto: RegisterStaffDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log('=========================: ', authHeader);
    return this.staffClient.send(PATTERNS.STAFF_CREATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }
  //Get all staff for roles like Internal driver,customer service, dispatch officer, branch manager
  @Get()
  async findStaff(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    console.log('Getting all staff');

    const authHeader = req.headers['authorization'] || null;

    // Wait for microservice response
    const result = await firstValueFrom(
      this.staffClient.send(PATTERNS.STAFF_FIND_ALL, {
        headers: { authorization: authHeader },
        page: Number(page),
        pageSize: Number(pageSize),
        search,
      }),
    );

    console.log('Staff result:', result);
    return result;
  }

  //Get staff by their roles and it is manadatory to pass role
  @Get('role/staff')
  async findStaffByRole(
    @Req() req: Request,
    @Query('role') role: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    console.log('lOGGING FOR ROLE : ', role);
    const authHeader = req.headers['authorization'] || null;

    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_ROLE, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      role: role,
    });
  }
  //delete staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Delete(':id')
  async deleteStaff(@Param('id') id: string) {
    console.log('Deleting....');

    return this.staffClient.send(PATTERNS.STAFF_DELETE, { id });
  }

  @Patch(':id')
  async updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    console.log('this is dto : ', dto);

    return this.staffClient.send(PATTERNS.STAFF_UPDATE, { id, data: dto });
  }

  @Get(':id')
  async findStaffById(@Param('id') id: string) {
    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_ID, { id });
  }

  @Get('/branch/:branchId')
  async findStaffByBranch(
    @Param('branchId') branchId: string,
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_BRANCH, {
      headers: { authorization: authHeader },
      branchId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search,
    });
  }

  @Post('assign-branch')
  async assignBranch(@Body() dto: { staffIds: string[]; branchId: string }) {
    return this.staffClient.send(PATTERNS.STAFF_ASSIGN_BRANCH, dto);
  }
}
