import { createClient, SupabaseClient } from '@supabase/supabase-js'

function looksLikePlaceholder(value: string): boolean {
	const normalized = value.trim().toLowerCase()
	return (
		normalized.length === 0 ||
		normalized.includes('your_supabase') ||
		normalized.includes('your_supabase_secret') ||
		normalized.includes('cole_aqui') ||
		normalized.includes('placeholder')
	)
}

function getRequiredEnv(name: 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY'): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}

	if (looksLikePlaceholder(value)) {
		throw new Error(`Invalid value for ${name}: replace placeholder with a real Supabase credential`)
	}

	return value
}

const supabaseUrl = getRequiredEnv('SUPABASE_URL')
const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
})
