import authApi from '@/services/auth'
import { queryClient } from '@/constants'
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/lib/axios'
import { ROUTE_PATHS } from '@/router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { notification } from 'antd'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const navigate = useNavigate()

  const {
    data: user,
    isLoading: loadingInitial,
    error: error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      if (!response) {
        // TODO: Redirect to login
        // localStorage.clear()
        // navigate(ROUTE_PATHS.LOGIN)
        return null
      } else return response
    },
  })

  const signInMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => authApi.signIn(username, password),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.data.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken)
      console.log(TOKEN_KEY, REFRESH_TOKEN_KEY)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate(ROUTE_PATHS.ROOT)
      notification.success({
        message: data.message,
        description: 'You have successfully logged in',
      })
    },
    onError: (error) => {
      notification.error({
        message: error.message,
        description: 'Your username or password is incorrect.',
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logOut(),
    onSuccess: () => {
      localStorage.clear()
      window.location.reload()
    },
    onError: (error) => {
      notification.error({
        message: error.message,
        description: 'Logout Failed!',
      })
    },
  })

  return { user, loadingInitial, error, signInMutation, logoutMutation }
}
