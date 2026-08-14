export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
  source: string | null
  priority: number | null
  is_active: boolean | null
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

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: Business
        Insert: {
          id?: string
          name: string
          industry: string
          website?: string | null
          email?: string | null
          phone?: string | null
          booking_url?: string | null
          opening_hours?: string | null
          brand_voice?: string | null
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string
          website?: string | null
          email?: string | null
          phone?: string | null
          booking_url?: string | null
          opening_hours?: string | null
          brand_voice?: string | null
          owner_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      assistants: {
        Row: Assistant
        Insert: {
          id?: string
          business_id: string
          name: string
          welcome_message?: string | null
          system_instructions?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          welcome_message?: string | null
          system_instructions?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }

      knowledge: {
        Row: Knowledge
        Insert: {
          id?: string
          business_id: string
          title: string
          content: string
          source?: string | null
          priority?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          content?: string
          source?: string | null
          priority?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }

      services: {
        Row: Service
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          price?: number | null
          duration?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          price?: number | null
          duration?: string | null
          created_at?: string
        }
        Relationships: []
      }

      faqs: {
        Row: Faq
        Insert: {
          id?: string
          business_id: string
          question: string
          answer: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          question?: string
          answer?: string
          created_at?: string
        }
        Relationships: []
      }

      policies: {
        Row: Policy
        Insert: {
          id?: string
          business_id: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }

      conversations: {
        Row: Conversation
        Insert: {
          id?: string
          assistant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          assistant_id?: string
          created_at?: string
        }
        Relationships: []
      }

      messages: {
        Row: Message
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
        Relationships: []
      }

      leads: {
        Row: Lead
        Insert: {
          id?: string
          business_id: string
          name: string
          email: string
          phone?: string | null
          enquiry: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          email?: string
          phone?: string | null
          enquiry?: string
          created_at?: string
        }
        Relationships: []
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}
