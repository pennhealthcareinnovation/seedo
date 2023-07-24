type ApiRequest = {
  endpoint: string
  method?: 'GET' | 'POST'
  query?: URLSearchParams
  body?: any
}

export type ApiResponse<ControllerFunction extends (...args: any) => any> = Awaited<ReturnType<ControllerFunction>>

const API_URL = window?._ENV_?.API_URL

export async function apiRequest<ControllerFunction extends (...args: any) => any>({ endpoint, method = 'GET', query, body }: ApiRequest) {
  const options = {
    method,
    body
  }

  try {
    const response = await fetch(`${API_URL}/${endpoint}${query ? `?${query}` : ''}`, options)
    return response.json() as ApiResponse<ControllerFunction>
  } catch (e) {
    console.error(e)
    throw (e)
  }
}