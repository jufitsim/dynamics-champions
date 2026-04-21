import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dynamics-light flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-dynamics-blue mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">This page doesn't exist.</p>
        <Link to="/" className="btn-primary justify-center">Back to Champions</Link>
      </div>
    </div>
  )
}
