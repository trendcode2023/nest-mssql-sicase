import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getProfileByName(name: string) {
    return this.profileRepository.findOne({ where: { name } });
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileRepository.find();
  }
}
