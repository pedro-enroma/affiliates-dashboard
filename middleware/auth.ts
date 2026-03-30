export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/confirm']
  if (publicRoutes.includes(to.path)) return

  // If no user, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
