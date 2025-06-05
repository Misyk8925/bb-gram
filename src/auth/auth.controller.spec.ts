import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { HttpStatus } from '@nestjs/common';
import { UserAttributes } from '@supabase/supabase-js';
import { SupabaseService } from '../common/supabase/supabase.service';

// Mock the AuthService
const mockAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getMe: jest.fn(),
  refreshToken: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
};

// Mock the SupabaseService
const mockSupabaseService = {
  getClient: jest.fn().mockReturnValue({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  }),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp with correct parameters', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { user: { id: '123' }, session: { access_token: 'token' } };
      mockAuthService.signUp.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signUp(authDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(authDto.email, authDto.password);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.signUp', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.signUp.mockRejectedValue(new Error('Signup failed'));

      // Act & Assert
      await expect(controller.signUp(authDto)).rejects.toThrow('Signup failed');
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct parameters', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { user: { id: '123' }, session: { access_token: 'token' } };
      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(authDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(authDto.email, authDto.password);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.signIn', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      // Act & Assert
      await expect(controller.signIn(authDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should call authService.signOut', async () => {
      // Arrange
      const expectedResult = { message: 'User signed out' };
      mockAuthService.signOut.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signOut();

      // Assert
      expect(authService.signOut).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.signOut', async () => {
      // Arrange
      mockAuthService.signOut.mockRejectedValue(new Error('Signout failed'));

      // Act & Assert
      await expect(controller.signOut()).rejects.toThrow('Signout failed');
    });
  });

  describe('getMe', () => {
    it('should call authService.getMe with correct token', async () => {
      // Arrange
      const token = 'valid-token';
      const expectedResult = { email: 'test@example.com', role: 'user', last_sign_in_at: '2023-01-01', created_at: '2023-01-01' };
      mockAuthService.getMe.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getMe(token);

      // Assert
      expect(authService.getMe).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.getMe', async () => {
      // Arrange
      const token = 'invalid-token';
      mockAuthService.getMe.mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await expect(controller.getMe(token)).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken with correct token', async () => {
      // Arrange
      const token = 'refresh-token';
      const expectedResult = { session: { access_token: 'new-token' } };
      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.refreshToken(token);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.refreshToken', async () => {
      // Arrange
      const token = 'invalid-token';
      mockAuthService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

      // Act & Assert
      await expect(controller.refreshToken(token)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct email', async () => {
      // Arrange
      const email = 'test@example.com';
      const expectedResult = {};
      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.resetPassword(email);

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.resetPassword', async () => {
      // Arrange
      const email = 'invalid@example.com';
      mockAuthService.resetPassword.mockRejectedValue(new Error('Reset password failed'));

      // Act & Assert
      await expect(controller.resetPassword(email)).rejects.toThrow('Reset password failed');
    });
  });

  describe('updatePassword', () => {
    it('should call authService.updatePassword with correct attributes', async () => {
      // Arrange
      const userAttributes: UserAttributes = { password: 'newPassword123' };
      const expectedResult = { user: { id: '123' } };
      mockAuthService.updatePassword.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.updatePassword(userAttributes);

      // Assert
      expect(authService.updatePassword).toHaveBeenCalledWith(userAttributes);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.updatePassword', async () => {
      // Arrange
      const userAttributes: UserAttributes = { password: 'weak' };
      mockAuthService.updatePassword.mockRejectedValue(new Error('Password update failed'));

      // Act & Assert
      await expect(controller.updatePassword(userAttributes)).rejects.toThrow('Password update failed');
    });
  });
});