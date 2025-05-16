import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { MovieDetails } from './pages/MovieDetails'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Favorites } from './pages/Favorites'
import { History } from './pages/History'
import { Genres } from './pages/Genres'
import { GenreFilms } from './pages/GenreFilms'
import { Movies } from './pages/Movies'
import { VideoPlayer } from './pages/VideoPlayer'
import { TestPage } from './pages/TestPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Users from './pages/Users'
import Films from './pages/Films'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/watch/:id" element={<VideoPlayer />} />
          <Route path="/test" element={<TestPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<Movies />} />
            <Route path="movies/:id" element={<MovieDetails />} />
            <Route path="genres" element={<Genres />} />
            <Route path="genres/:id" element={<GenreFilms />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="films"
              element={
                <ProtectedRoute>
                  <Films />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
