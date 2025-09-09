// Supabase configuration and client setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// These environment variables will be available after connecting to Supabase
const supabaseUrl = 'https://lpaczuvwlsjsaotarkrj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWN6dXZ3bHNqc2FvdGFya3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQ5MjMsImV4cCI6MjA2MTU3MDkyM30.d1M_7Jfdyeow9OMHdUuQoKjxNR5SIhVZx86vkbL-kWs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helper functions
export const authHelpers = {
  // Sign up new user
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}