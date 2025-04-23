import axios from 'axios'

export async function handleLogoutShared(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
) {
  const token = localStorage.getItem('token')

  try {
    await axios.post(
      'http://localhost:5000/users/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch (err) {
    console.error('Erreur lors de la déconnexion :', err)
  } finally {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }
}
