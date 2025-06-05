'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    const { error } = isLogin
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError('')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
    <h2 className="text-2xl font-semibold text-center mb-4">
    {isLogin ? 'Login' : 'Sign Up'}
    </h2>
    <input
    className="w-full mb-3 p-2 border rounded"
    type="email"
    placeholder="Email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    />
    <input
    className="w-full mb-3 p-2 border rounded"
    type="password"
    placeholder="Password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    />
    <button
    onClick={handleAuth}
    className="w-full bg-blue-600 text-white p-2 rounded mb-3"
    >
    {isLogin ? 'Login' : 'Create Account'}
    </button>
    <p
    onClick={() => setIsLogin(!isLogin)}
    className="text-sm text-center text-blue-500 cursor-pointer"
    >
    {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
    </p>
    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
    </div>
  )
}
