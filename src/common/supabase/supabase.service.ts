import { Injectable } from '@nestjs/common';
import {SupabaseClient} from "@supabase/supabase-js";


@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient

    constructor() {
        const supabaseURL = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        console.log("sp data", supabaseURL, supabaseKey);

        if (!supabaseURL || !supabaseKey) {
            throw new Error('Supabase URL or key is not defined');
        }
        this.supabase = new SupabaseClient(supabaseURL, supabaseKey);
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
