import { Roles } from "./entities/role.entity";

export class AuthHelper {
  
  static canAccessOtherUsers(request: Request, userId: number): boolean {
    const role: Roles = request['user'].role
    const loggedInUserId: number = request['user'].sub
    
    if (role == Roles.ADMIN) {
      return true
    } else {
      return role === Roles.USER && loggedInUserId === userId;
    }
  }

  static canDeleteUser(request: Request, userId: number): boolean {
    return request['user'].sub != userId;
  }
  
}