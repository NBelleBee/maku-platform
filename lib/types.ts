export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

type GenericRelationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Business {
  id: string
  name: string
  industry: string
  website: string | null
  email: string | null
  phone: string | null
  booking_url: string | null
  opening_hours: string | null
  brand_voice: string | null
  owner_id: string | null
  created_at: string
}

export interface Assistant {
  id: string
  business_id: string
  name: string
  welcome_message: string | null
  system_instructions: string | null
  is_active: boolean
  created_at: string
}

export interface Knowledge {
  id: string
  business_id: string
  title: string
  content: string
  created_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
  created_at: string
}

export interface Faq {
  id: string
  business_id: string
  question: string
  answer: string
  created_at: string
}

export interface Policy {
  id: string
  business_id: string
  title: string
  content: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  assistant_id: string
  created_at: string
}

export interface Lead {
  id: string
  business_id: string
  name: string
  email: string
  phone: string | null
  enquiry: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business
        Insert: Omit<Business, 'id' | 'created_at'>
        Update: Partial<Omit<Business, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      assistants: {
        Row: Assistant
        Insert: {
          business_id: string
          name: string
          welcome_message?: string | null
          system_instructions?: string | null
          is_active?: boolean
        }
        Update: {
          business_id?: string
          name?: string
          welcome_message?: string | null
          system_instructions?: string | null
          is_active?: boolean
        }
        Relationships: GenericRelationship[]
      }
      knowledge: {
        Row: Knowledge
        Insert: Omit<Knowledge, 'id' | 'created_at'>
        Update: Partial<Omit<Knowledge, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at'>
        Update: Partial<Omit<Service, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      faqs: {
        Row: Faq
        Insert: Omit<Faq, 'id' | 'created_at'>
        Update: Partial<Omit<Faq, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      policies: {
        Row: Policy
        Insert: Omit<Policy, 'id' | 'created_at'>
        Update: Partial<Omit<Policy, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at'>
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
        Relationships: GenericRelationship[]
      }
    }
    Views: Record<string, {
      Row: Record<string, unknown>
      Relationships: GenericRelationship[]
    }>
    Functions: Record<string, {
      Args: Record<string, unknown> | never
      Returns: unknown
      SetofOptions?: {
        isSetofReturn?: boolean
        isOneToOne?: boolean
        isNotNullable?: boolean
        to: string
        from: string
      }
    }>
    Enums: Record<string, string[]>
    CompositeTypes: Record<string, never>
  }
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
}
