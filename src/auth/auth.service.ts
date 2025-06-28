import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {SupabaseService} from "../common/supabase/supabase.service";
import {UserAttributes} from "@supabase/supabase-js";

/**
 * AuthService handles all authentication-related operations for the bb-gram application.
 * This service integrates with Supabase Auth to provide user authentication, authorization,
 * and user management functionality.
 */
@Injectable()
export class AuthService {
    // Logger instance for tracking authentication operations
    private readonly logger = new Logger('AuthService');

    /**
     * Constructor - injects SupabaseService for authentication operations
     * @param supabaseService - Service for interacting with Supabase backend
     */
    constructor(private supabaseService: SupabaseService) {}

    /**
     * Creates a new user account with email and password
     * @param email - User's email address
     * @param password - User's password
     * @returns User data from Supabase Auth
     * @throws UnauthorizedException if signup fails
     */
    async signUp(email: string, password: string){
        // Create new user account using Supabase Auth
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.signUp({
            email,
            password,
        });

        this.logger.log(`User signed up: ${data}`);

        // Handle authentication errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    /**
     * Authenticates an existing user with email and password
     * @param email - User's email address
     * @param password - User's password
     * @returns User session data including access token
     * @throws UnauthorizedException if signin fails
     */
    async signIn(email:string, password: string){
        // Authenticate user with Supabase Auth
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.signInWithPassword({
            email,
            password,
        });

        this.logger.log(`User signed in: ${data}`);

        // Handle authentication errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    /**
     * Signs out the current user and invalidates their session
     * @returns Success message
     * @throws UnauthorizedException if signout fails
     */
    async signOut(){
        // Sign out user and invalidate session
        const {error} = await this.supabaseService
            .getClient()
            .auth.signOut();

        this.logger.log(`User signed out`);

        // Handle signout errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return {message: 'User signed out'};
    }

    /**
     * Retrieves the current user's profile information using an access token
     * @param token - JWT access token for authentication
     * @returns User profile data including email, role, and timestamps
     * @throws UnauthorizedException if token is invalid or user not found
     */
    async getMe(token:string){
        // Fetch user data from Supabase using the provided access token
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.getUser(token);

        this.logger.log(`User retrieved: ${data}`);

        // Handle authentication errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        // Prepare user data for extraction
        const meData = {
            user: data.user
        }

        /**
         * Extracts and validates essential user information
         * @param data - Raw user data from Supabase
         * @returns Formatted user profile object
         */
        const extractMeData = (data: typeof meData) => {
            // Validate user exists
            if (!data.user) {
                throw new UnauthorizedException('User not found');
            }

            // Extract essential user fields
            const {email, role, last_sign_in_at} = data.user;
            const created_at = data.user.identities?.[0]?.created_at;

            // Validate all required fields are present
            if (!email || !role || !last_sign_in_at || !created_at) {
                throw new UnauthorizedException('User not found');
            }

            // Return cleaned user profile data
            return {
                email,
                role,
                last_sign_in_at,
                created_at,
            }
        }
        return extractMeData(meData);
    }

    /**
     * Refreshes an expired access token using a refresh token
     * @param token - Refresh token to obtain a new access token
     * @returns New session data with fresh access and refresh tokens
     * @throws UnauthorizedException if refresh token is invalid
     */
    async refreshToken(token: string){
        // Refresh the user session using the refresh token
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.refreshSession({refresh_token: token});

        this.logger.log(`User refreshed: ${data}`);

        // Handle refresh errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    /**
     * Initiates a password reset process by sending a reset email to the user
     * @param email - Email address to send the password reset link to
     * @returns Confirmation data from Supabase
     * @throws UnauthorizedException if email is invalid or reset fails
     */
    async resetPassword(email: string) {
        // Send password reset email through Supabase Auth
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.resetPasswordForEmail(email);

        this.logger.log(`User reset password: ${data}`);

        // Handle reset password errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    /**
     * Updates a user's password or other attributes
     * @param userAttributes - Object containing user attributes to update (e.g., password)
     * @returns Updated user data from Supabase
     * @throws UnauthorizedException if update fails or user is not authenticated
     */
    async updatePassword(userAttributes: UserAttributes) {
        // Update user attributes (password) through Supabase Auth
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.updateUser(userAttributes);

        this.logger.log(`User updated password: ${data}`);

        // Handle update errors
        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }
}


