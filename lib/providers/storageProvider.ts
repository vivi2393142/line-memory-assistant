import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { RawMessage, PendingAction } from '@/lib/types'

export class StorageProvider {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.SUPABASE_ENDPOINT!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // ============ Raw Messages ============

  async saveRawMessage(
    data: Omit<RawMessage, 'id' | 'created_at'>,
  ): Promise<RawMessage> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return message
  }

  async getRawMessage(id: string): Promise<RawMessage | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async getLatestRawMessage(
    userId: string,
    groupId: string | null,
  ): Promise<RawMessage | null> {
    const query = this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (groupId) {
      query.eq('group_id', groupId)
    } else {
      query.is('group_id', null)
    }

    const { data, error } = await query.single()

    if (error) return null
    return data
  }

  async getRawMessageByLineId(
    lineMessageId: string,
  ): Promise<RawMessage | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('line_message_id', lineMessageId)
      .single()

    if (error) return null
    return data
  }

  // ============ Pending Actions ============

  async createPendingAction(
    data: Omit<PendingAction, 'id' | 'created_at'>,
  ): Promise<PendingAction> {
    // Delete old pending for this user (each user can only have 0~1 pending)
    await this.deletePendingAction(data.user_id, data.group_id)

    const { data: pending, error } = await this.supabase
      .from('pending_actions')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return pending
  }

  async getPendingAction(
    userId: string,
    groupId: string | null,
  ): Promise<PendingAction | null> {
    const query = this.supabase
      .from('pending_actions')
      .select('*')
      .eq('user_id', userId)

    if (groupId) {
      query.eq('group_id', groupId)
    } else {
      query.is('group_id', null)
    }

    const { data, error } = await query.single()

    if (error) return null

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      await this.deletePendingAction(userId, groupId)
      return null
    }

    return data
  }

  async deletePendingAction(
    userId: string,
    groupId: string | null,
  ): Promise<void> {
    const query = this.supabase
      .from('pending_actions')
      .delete()
      .eq('user_id', userId)

    if (groupId) {
      query.eq('group_id', groupId)
    } else {
      query.is('group_id', null)
    }

    await query
  }
}
