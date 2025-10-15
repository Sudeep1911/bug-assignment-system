import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { UsersRepo } from './user.repo';
import { generateRandomPassword } from 'src/utils/password.utils';
import { CompanyRepo } from 'src/company/company.repo';
import axios from 'axios';
import e from 'express';

@Injectable()
export class UsersService {
  constructor(
    private userRepo: UsersRepo,
    private companyRepo: CompanyRepo,
  ) {}

  // Create a new user
  async createUser(
    email: string,
    password: string,
    role: 'admin' | 'developer' | 'tester',
    name?: string,
  ): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userRepo.createUser(email, password, role, name);
    return newUser;
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user?.password !== password) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async createEmployees(
    employeesData: {
      role: 'developer' | 'tester';
      email: string;
      name: string;
    }[],
    companyId: string,
  ) {
    const [existingUsers, company] = await Promise.all([
      this.userRepo.findUsersByCompanyId(companyId),
      this.companyRepo.findCompanyById(companyId),
    ]);

    if (!company) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    // Convert to maps for faster lookup
    const existingUsersMap = new Map(
      existingUsers.map((u) => [u.email.toLowerCase(), u]),
    );

    // Track which users should remain
    const incomingEmails = new Set(
      employeesData.map((e) => e.email.toLowerCase()),
    );

    // Handle Create & Update
    await Promise.all(
      employeesData.map(async (data) => {
        const { role, email, name } = data;
        const emailKey = email.toLowerCase();

        const existingEmployee = existingUsersMap.get(emailKey);

        if (existingEmployee) {
          // Update if role or name changed
          if (
            existingEmployee.role !== role ||
            existingEmployee.name !== name
          ) {
            existingEmployee.role = role;
            existingEmployee.name = name;
            await this.userRepo.updateUserData(
              existingEmployee._id,
              existingEmployee,
            );
          }
          return;
        }

        // Not found in this company → check if global user exists
        let user = await this.userRepo.findByEmail(email);

        if (!user) {
          // New user: create with password
          const password = generateRandomPassword(8);
          user = await this.userRepo.createUserWithCompanyId(
            email,
            password,
            role,
            name,
            companyId,
          );
          await this.sendEmail(email, company.name, password);
        } else {
          // Existing global user, just link to company
          await this.userRepo.updateUser(user._id, companyId);
          await this.sendEmail(email, company.name);
        }
      }),
    );

    // Handle Delete: remove employees that are in DB but not in incoming list
    const usersToDelete = existingUsers.filter(
      (u) => !incomingEmails.has(u.email.toLowerCase()),
    );

    if (usersToDelete.length > 0) {
      await Promise.all(
        usersToDelete.map((user) =>
          this.userRepo.deleteUserCompany(user._id, companyId),
        ),
      );
    }

    return { success: true };
  }
  async sendEmail(email: string, companyName: string, password?: string) {
    try {
      const baseMessage = `You have been added to the company: ${companyName}.`;
      const loginUrl = `${process.env.BASE_URL}/login`;

      const body = password
        ? `Your account has been created.<br>
           Email: ${email}<br>
           Password: ${password}<br>
           You can now log in by clicking the button below:<br>
           <a href="${loginUrl}" class="btn">Login</a>`
        : `You can now log in using your existing credentials.<br>
           <a href="${loginUrl}" class="btn">Login</a>`;

      const payload = {
        TO: email,
        sub: `Welcome to Bug Tracker Pro, ${email}`,
        body,
      };

      const response = await axios.post(
        'https://hooks.konnectify.co/webhook/v1/KvOIOTol3d',
        payload,
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Email sending failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
