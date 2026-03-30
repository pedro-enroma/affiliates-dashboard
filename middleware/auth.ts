export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Public routes — no auth needed
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/confirm']
  if (publicRoutes.includes(to.path)) return

  // No user → redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Check role (cached after first call)
  const { isAdmin, checkRole } = useAuth()
  await checkRole()

  const isAdminRoute = to.path === '/admin' || to.path.startsWith('/admin/')

  // Admin trying to access affiliate routes → redirect to admin dashboard
  if (isAdmin.value && !isAdminRoute) {
    return navigateTo('/admin')
  }

  // Affiliate trying to access admin routes → redirect to affiliate dashboard
  if (!isAdmin.value && isAdminRoute) {
    return navigateTo('/')
  }
})
