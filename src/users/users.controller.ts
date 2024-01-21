import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileImagePipe } from './pipes/profile.image.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { AllowedRoles } from '../auth/decorators/allow.roles.decorator';
import { Roles } from '../auth/entities/role.entity';
import { AuthHelper } from '../auth/auth.helper';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @AllowedRoles(Roles.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {

    if (!AuthHelper.canAccessOtherUsers(request, id)) {
      throw new ForbiddenException();
    }

    return this.usersService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request
  ) {

    if (!AuthHelper.canAccessOtherUsers(request, id)) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.update(id, updateUserDto);
    return user
  }

  @Delete(':id')
  @AllowedRoles(Roles.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {

    if (!AuthHelper.canDeleteUser(request, id)) {
      throw new ForbiddenException();
    }

    return this.usersService.remove(id);
  }

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({schema: {type: 'object', properties: {image: {type: 'string', format: 'binary'}}}})
  @AllowedRoles(Roles.USER)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile(ProfileImagePipe) imageName: string,
    @Req() request: Request
  ) {

    const userId: number = request['user'].sub
    const user = await this.usersService.updateProfileImage(userId, imageName)

    return user.profileImage;
  }
}
