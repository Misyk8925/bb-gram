import {BadRequestException, Injectable} from '@nestjs/common';
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

    async uploadFile(
        bucket: string,
        path: string,
        file: Buffer,
        contentType: string,
    ) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, file, { contentType });
        if (error) {
            throw new BadRequestException(`Upload failed: ${error.message}`);
        }
        return data; // { Key, publicURL, etc. }
    }

    getPublicUrl(bucket: string, path: string) {
        return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
}
