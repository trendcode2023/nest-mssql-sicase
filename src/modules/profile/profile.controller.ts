import { Controller, Get } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";

@Controller("profile")
export  class ProfileController {

  constructor(private readonly profileService: ProfileService) {}

  @Get('getall')
  @ApiBearerAuth()
  @Roles('admin')
  getAllQuest() {
    return this.profileService.getAllProfiles();  
  }

}