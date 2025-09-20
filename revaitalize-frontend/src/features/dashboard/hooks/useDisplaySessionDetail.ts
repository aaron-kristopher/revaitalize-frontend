const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useDisplaySessionDetail = () => {
  const getSessionById = async (user_id: number, session_id: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${user_id}/sessions/${session_id}/detail`);

    try {
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`)
      }

      const result = await response.json();
      console.log(result)
    } catch (error) {
      console.error("Error calling api: ", error)
    }
  }

  return { getSessionById };
}
